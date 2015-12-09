"use strict";

var yelpClass = function(){
	this.proxyurl = 'js/yelp_api_proxy.php';
	this.nonceCounter = 0;
}

//var proxyurl = 'js/yelp_api_proxy.php';

yelpClass.prototype.getRequest = function(params,rating) {
	//ex: https://api.yelp.com/v2/search?term=restaurants&cll=0,0&radius_filter=25
	var httpMethod = 'GET',
		url = "https://api.yelp.com/v2/search/";

	var queryString = '';
	for(var param in params) {
		queryString += param + '=' + params[param] + '&';
	}
	queryString += "limit=20";
    
	var proxyQuery = this.proxyurl + '?url=' + encodeURIComponent('v2/search?' + queryString);
	console.log(proxyQuery);
	var xhr = new XMLHttpRequest();
	if("withCredentials" in xhr)
		xhr.open(httpMethod,proxyQuery,true);
	else if(typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
		xhr.open(httpMethod,proxyQuery);
	}
	else
		xhr = null;
	if(!xhr) {
		alert("CORS not supported");
		return;
	}
	xhr.onload = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			//console.log("Success!");
			var results = JSON.parse(xhr.responseText);
			map.displayOnMap(results,rating);//in map.js
		}
	}
	
	xhr.onerror = function(response) {
		alert("Error in XHR");
	}
	xhr.send();
}

//var nonceCounter = 0;
yelpClass.prototype.getnNonce = function() {
	var nonce = "" + this.nonceCounter;
	for(var i = nonce.length; i < 32; i++) {
		var c = Math.floor(Math.random() * 26);
		var caps = Math.random() > 0.5;
		nonce = String.fromCharCode(c + ((caps) ? 65 : 97)) + nonce;
	}
	this.nonceCounter++;
	return nonce;
}