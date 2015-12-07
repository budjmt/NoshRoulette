"use strict";

//reason this is global is so the google maps callback can work
var map = new mapClass();

(function(){
	
var category, distance, pricePoint, rating;
var yelp = new yelpClass();

function updateUserPref(term,val) {
		var key = 'mxc8518_noshroulette_' + term;
		localStorage.setItem(key, val);
	}

function init() {
	category = document.getElementById('category');	
	distance = document.getElementById('distance');	
	//pricePoint = document.getElementById('pricePoint');	
	rating = document.getElementById('rating');	
	
	var userCat    = localStorage.getItem('mxc8518_noshroulette_category'),
		userDist   = localStorage.getItem('mxc8518_noshroulette_distance'),
		userRating = localStorage.getItem('mxc8518_noshroulette_rating');
	if(userCat != null)
		category.selectedIndex = userCat;
	if(userDist != null)
		distance.selectedIndex = userDist;
	if(userRating != null);
		//category.selectedIndex = userCat;
	
	category.onchange = function() { 
		//console.log("meow");
		updateUserPref('category',category.selectedIndex); 
	};
	distance.onchange = function() {
		//console.log('d');
		updateUserPref('distance',distance.selectedIndex);
	};
	
	document.getElementById('searchButton').onclick = function() {
		
	$("#loading").accordion({active:0});
		
	var latlng = { lat : initialLocation.lat(), lng : initialLocation.lng() },
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

window.onload = init;

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