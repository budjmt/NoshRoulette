"use strict";

var map;
var infoWindow;
var markers = [];
var myMarker;

var markerCss = '<style>b { font-weight: bold; }'
markerCss += '.price { font-weight: bold; color: green }';
markerCss += '.price::after { content: attr(data-remainder); color: grey; margin-right: 10px; }';
markerCss += '.extra { font-weight: bold; }';
markerCss += '</style>';

var rochester;
var initialLocation;
var geoSupportFlag = true;

function initMap() {
	rochester = new google.maps.LatLng(43.083848, -77.6799);
	map = new google.maps.Map(document.getElementById('map'), {
		center: rochester,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	//w3c location stuff
	if(navigator.geolocation) {
		geoSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
		addBasicMarker(initialLocation,"You");
		myMarker = markers[0];
		}, function() {
		handleNoGeolocation(geoSupportFlag);
		});
	}
	// Browser doesn't support Geolocation
	else {
		geoSupportFlag = false;
		handleNoGeolocation(geoSupportFlag);
	}
	
	function handleNoGeolocation(errorFlag) {
		if (errorFlag == true) {
		alert("Geolocation service failed.");
		initialLocation = rochester;
		} else {
		alert("Your browser doesn't support geolocation. We've placed you in Rochester.");
		initialLocation = rochester;
		}
		map.setCenter(initialLocation);
		addBasicMarker(initialLocation,"You");
	}
	//map.mapTypeId = 'satellite';
	//map.setTilt(45);
}

function addBasicMarker(position,title) {
	var marker = new google.maps.Marker({position: position, map: map});
	var style = '<style>b { font-weight: bold; } p { min-width: 25px; overflow: hidden; }</style>';
	marker.setTitle(style + '<p><b>' + title + '</b></p>');
	google.maps.event.addListener(marker,'click',function(e) {
	makeInfoWindow(this.position,this.title);
	});
	markers.push(marker);
}

function addMarker(position,title,ratingImg,img,address,phone,website,hours,menu,price) {
	var marker = new google.maps.Marker({position: position, map: map});
	var info = markerCss;
	info += '<p><b>' + title + '</b></p>';
	info += '<p><img src="' + ratingImg + '" /></p>';
	if(price) {
		info += '<p><span class="price" data-remainder="' + price.data_remainder + '">' 
			+ "$$$$".substring(price.data_remainder.length) + '</span>';
		info += '<span><b>' + price.price_range + '</b></span></p>';
	}
	if(img)
		info += '<p><img src="' + img + '" /></p>';
	info += '<p>' + address + '</p>';
	if(hours) info += hours;//already a table element
	if(menu)  info += '<p><b>' + menu + '</b></p>';//already a link element
	info += '<p><b>Phone:</b> ' + phone + '</p>';
	info += '<p><b>Website:</b> <a href="' + website + '">' + website + '</a></p>';
	marker.setTitle(info);
	//console.log(info);
	google.maps.event.addListener(marker,'click',function(e) {
	makeInfoWindow(this.position,this.title);
	});
	markers.push(marker);
}

function makeInfoWindow(position,msg) {
	if(infoWindow) infoWindow.close();
	infoWindow = new google.maps.InfoWindow({
		map: map,
		position: position,
		content: msg
	});
}

function drawPolygon(paths,title,position) {
	var polygon = new google.maps.Polygon({
	map: map,
	paths: paths,
	fillColor: '#f0f',
	fillOpacity: 0.3,
	strokeColor: "#0f0",
	strokeWeight: 3,
	position: position,
	title: title	
	});
	google.maps.event.addListener(polygon,'click',function(e) {
	makeInfoWindow(this.position,this.title);
	});
}

//need to add a way to zoom out to where the places are
//and draw a circle around the results
//also differentiate the color of you vs them
function displayOnMap(results) {
	if(infoWindow) infoWindow.close();
	for(var i = 1;i < markers.length;i++)
		markers[i].setMap(null);
	markers = [];
	markers.push(myMarker);
	
	var deferreds = [], extraResults = [], weekHours = [];
	var proxyQuery = 'js/restaurant_data_proxy.php?url=';
	for(var i = 0;i < results.businesses.length;i++) {
		//data
		deferreds.push($.get(proxyQuery + encodeURI(results.businesses[i].url), {
				delay: i + 1,
				timeout: 45000
		}).success(function(data) {
			data = data.replace(/\r?\n|\r/g,'');
			data = data.substring(data.indexOf('<body'));
			data = '<html>' + data;
			var html = $.parseHTML(data);
			var restData;
			for(var node of html) {
				if(node.outerHTML)
					restData = $(node.outerHTML).find('.summary').children()[0];
					if(restData)
						break;
			}
			
			//var todayHours = restData.find('.hour-range');
			var weekHours = $(html).find('.hours-table')[0];
			if(weekHours) { weekHours = weekHours.outerHTML; }
			
			var menuLink = $(restData).find('.menu-explore')[0];
			if(menuLink) { 
				menuLink = menuLink.outerHTML;
				menuLink = menuLink.replace('href="','href="http://yelp.com');
			}
			
			var priceRange = $(restData).find('.price-range')[0];
			var priceData;
			if(priceRange) {
				var dataRemainder = priceRange.getAttribute('data-remainder');
				if(dataRemainder.length < 1)
					priceData = "Above $61";
				else if(dataRemainder.length < 2)
					priceData = "$31-60";
				else if(dataRemainder.length < 3)
					priceData = "$11-30";
				else
					priceData = "Under $10";
				priceRange = { price_range   : priceData
							, data_remainder : dataRemainder };
			}
			extraResults.push({
				//todayHours : todayHours,
				weekHours  : weekHours,
				menuLink   : menuLink,
				priceRange : priceRange
			});
			console.log("done");
		}));
	}
	
	$.when.apply(null, deferreds).done(function() {
		console.log("begin processing");
		for(var i = 0;i < results.businesses.length;i++) {
			var business = results.businesses[i];
			var coord = new google.maps.LatLng(business.location.coordinate.latitude
											,business.location.coordinate.longitude);
			var address = '';
			for(var j = 0;j < business.location.address.length;j++)
				address += business.location.address[j] + ' ';
			address += business.location.city + ', ' + business.location.state_code;
			address += ' ' + business.location.postal_code;
			
			var extraBusinessData = extraResults[i];
			console.dir(extraBusinessData);
			
			addMarker(coord,business.name,business.rating_img_url,business.image_url
			,address,business.display_phone,business.url
			,extraBusinessData.weekHours,extraBusinessData.menuLink,extraBusinessData.priceRange);
		}
	});
}