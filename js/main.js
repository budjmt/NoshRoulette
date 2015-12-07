"use strict";

//reason this is global is so the google maps callback can work
var map = new mapClass();

window.onload = (function(){
	
var category, distance, pricePoint;
var yelp = new yelpClass();

function updateUserPref(term,val) {
	var key = 'mxc8518_noshroulette_' + term;
	localStorage.setItem(key, val);
}

init();

$( "#accordion" ).accordion({
    collapsible: true,
    active: false,
});

$( "#Popout" ).accordion({
    collapsible: true,
    active: false,
});
$( "#loading" ).accordion({
    collapsible: true,
    active: false,
});

var stars;
var rating;

function setupStars(){
	
	var children = stars = document.querySelector("#starRate").children;
	stars = new Array();
	for(var i = 0; i < children.length; i++){
		stars.push(children[i]);
		switch(i){
			case 0:
				stars[i].onmouseover = function(){starRating(1);};
				stars[i].onclick = function(){starClick(0);};
				break;
			case 1:
				stars[i].onmouseover = function(){starRating(2);};
				stars[i].onclick = function(){starClick(1);};
				break;
			case 2:
				stars[i].onmouseover = function(){starRating(3);};
				stars[i].onclick = function(){starClick(2);};
				break;
			case 3:
				stars[i].onmouseover = function(){starRating(4);};
				stars[i].onclick = function(){starClick(3);};
				break;
			case 4:
				stars[i].onmouseover = function(){starRating(5);};
				stars[i].onclick = function(){starClick(4);};
				break;
		}
		stars[i].onmouseout = setToRating;
		
	}
}

function starClick(i){
	rating = i+1;
	updateUserPref('rating',i+1);
}

function setToRating() {
	resetRating();
	for(var i = 0; i < rating; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}

function resetRating() {
	for(var i = 0; i < 5; i++){
		stars[i].children[0].src="css/yelp-star-bw.png";
	}
}

function starRating(e){
	resetRating();
	for(var i = 0; i < e; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}

function init() {
	category = document.getElementById('category');	
	distance = document.getElementById('distance');	
	//pricePoint = document.getElementById('pricePoint');	
	//rating = document.getElementById('rating');	
	
	var userCat    = localStorage.getItem('mxc8518_noshroulette_category'),
		userDist   = localStorage.getItem('mxc8518_noshroulette_distance'),
		userRating = localStorage.getItem('mxc8518_noshroulette_rating');
	if(userCat != null)
		category.selectedIndex = userCat;
	if(userDist != null)
		distance.selectedIndex = userDist;
	if(userRating != null) {
		starClick(userRating);
		setToRating();
	}
	
	category.onchange = function() { 
		//console.log("meow");
		updateUserPref('category',category.selectedIndex); 
	};
	distance.onchange = function() {
		//console.log('d');
		updateUserPref('distance',distance.selectedIndex);
	};
	
	setupStars();
	
	document.getElementById('searchButton').onclick = function() {
		
	$("#loading").accordion({active:0});
		
	var latlng = { lat : map.initialLocation.lat(), lng : map.initialLocation.lng() },
			//convert miles to meters
			radius = distance.options[distance.selectedIndex].value * 1609.34;
		//function doesn't work yet, actually we don't need it, tbd
		//var bounds = computeBounds(latlng,radius);
		var query = {
			term			: 'restaurants',
			ll : latlng.lat + ',' + latlng.lng,
			category_filter : category.options[category.selectedIndex].value,
			radius_filter   : radius
			//pricePoint : pricePoint.value,//this is probably incorrect
			//sorting for rating is done by yelp itself
			//filter for rating after data is retrieved
		}
		//console.log(query);
		yelp.getRequest(query,3);//in yelp.js
	}
}



/*
Computes the bounding lat-long coordinates for a box containing a circle of radius rad in meters.
To do this, we find a lat-lng one radius away south/north, then move one radius west/east.
This gives us the south-west and north-east corners, which we need for yelp
*/
function computeBounds(latlng,rad) {
	var radlatlng = { lat : latlng.lat * Math.PI / 180, lng : latlng.lng * Math.PI / 180 };
	
	var rsw = getCoordAtRad(radlatlng,rad,Math.PI * 1.5);
	//console.log(sw);
	rsw = getCoordAtRad(rsw,rad,Math.PI);
	var rne = getCoordAtRad(radlatlng,rad,Math.PI * 0.5);
	//console.log(ne);
	rne = getCoordAtRad(rne,rad,0);
	
	//all inputs must be radians (except radius which is converted in-function)
	function getCoordAtRad(coord,radius,angle) {
		var nlat, nlng;
		var radDist = radius * angle;//arc length
		nlat = Math.asin(Math.sin(coord.lat) * Math.cos(radDist) 
				  + Math.cos(coord.lat) * Math.sin(radDist) * Math.cos(angle));
		nlng = (Math.cos(nlat) == 0) ? coord.lng : 
		mod(coord.lng + Math.PI - Math.asin(Math.sin(angle) 
		* Math.sin(radDist) / Math.cos(nlat)), 2 * Math.PI) - Math.PI;
		return { lat : nlat, lng : nlng };
	}
	
	function mod(x,y) {
		return x - y * Math.floor(x / y);
	}
	
	var sw = { lat : rsw.lat * 180 / Math.PI, lng : rsw.lng * 180 / Math.PI };
	var ne = { lat : rne.lat * 180 / Math.PI, lng : rne.lng * 180 / Math.PI };
	
	return { sw : sw, ne : ne };
}
});