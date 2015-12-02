"use strict";

var map;
var infoWindow;
var markers = [];
var myMarker;

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
		addMarker(initialLocation,"You");
	}
	//map.mapTypeId = 'satellite';
	//map.setTilt(45);
}

function addBasicMarker(position,title) {
	var marker = new google.maps.Marker({position: position, map: map});
	marker.setTitle('<p><strong>' + title + '</strong></p>');
	google.maps.event.addListener(marker,'click',function(e) {
	makeInfoWindow(this.position,this.title);
	});
	markers.push(marker);
}

function addMarker(position,title,img,address,phone,website) {
	var marker = new google.maps.Marker({position: position, map: map});
	var info = '<p><strong>' + title + '</strong></p>';
	if(img)
		info += '<p><img src="' + img + '" /></p>';
	info += '<p>' + address + '</p>';
	info += '<p><strong>Phone:</strong> ' + phone + '</p>';
	info += '<p><strong>Website:</strong> <a href="' + website + '">' + website + '</a></p>';
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
	
	console.log(results);
	for(var i = 0;i < results.businesses.length;i++) {
		var business = results.businesses[i];
		var coord = new google.maps.LatLng(business.location.coordinate.latitude
										  ,business.location.coordinate.longitude);
		var address = '';
		for(var j = 0;j < business.location.address.length;j++)
			address += business.location.address[j] + ' ';
		address += business.location.city + ', ' + business.location.state_code;
		address += ' ' + business.location.postal_code;
		
		addMarker(coord,business.name,business.image_url
		,address,business.display_phone,business.url);
	}
}