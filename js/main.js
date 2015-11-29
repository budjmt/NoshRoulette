"use strict";

var category, distance, pricePoint, rating;

function init() {
	category = document.getElementById('category');	
	distance = document.getElementById('distance');	
	pricePoint = document.getElementById('pricePoint');	
	rating = document.getElementById('rating');	
	
	document.getElementById('searchButton').onclick = function() {
		var url = 'https://api.yelp.com/v2/search?term=restaurant'
		url += '&category_filter=' + category.value;
		url += '&radius_filter=' + distance.value;
		//url += '&pricePoint=' + pricePoint.value;//this is probably incorrect
		//sorting for rating is done by yelp itself
		//filter for rating after data is retrieved
		getRequest(url);
	}
}