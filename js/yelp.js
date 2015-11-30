"use strict";

var proxyurl = 'js/proxy.php';

function getRequest(params) {
	//ex: https://api.yelp.com/v2/search?term=restaurants&cll=0,0&radius_filter=25
	var httpMethod = 'GET',
		url = "https://api.yelp.com/v2/search/";
		/*parameters = {
			oauth_consumer_key : 'kP7zkeziNQdtSvYTezywjg',
			oauth_token : 'bdEkpVNQ4JZghLroR8AlY_YsRy04ioOp',
			oauth_signature_method : 'HMAC-SHA1',
			//oauth_signature : encodedSignature,
			oauth_timestamp : new Date().getTime(),
			oauth_nonce : genNonce(),
		},
		consumerSecret = 'cUSqCy2gLEa2Pl7Gm6H_c7q3MHg',
		tokenSecret = '6II4GCx51YCKENmt8BwBnsDSGDU',
		// generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
		encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret),
		// generates a BASE64 encode HMAC-SHA1 hash
		signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret,
			{ encodeSignature: false});
		
		parameters.oauth_signature = encodedSignature;
		for(var param in params)
			parameters[param] = params[param];*/
		//console.log(parameters);
		
		
		
		//function yay() { console.log('yay') }*/
		
		var queryString = '';
		for(var param in params) {
			//console.log(parameters[param]);
			queryString += param + '=' + params[param] + '&';
		}
		queryString = queryString.slice(0,-1);
		//console.log(queryString);
		
		var proxyQuery = proxyurl + '?url=' + encodeURIComponent('v2/search?' + queryString);
		
		/*$.ajax({ 
			url : proxyurl,
			//xhrField : { withCredentials : true },
			data : { url : 'v2/search?' + queryString },
			//contentType : 'application/json',
			//dataType : 'jsonp',
			//jsonp : false
			//jsonpCallback: 'yay'
		})
		.done(function(response) {
			//var results = JSON.parse(response);
			console.log(response);
		})
		.fail(function(xhr, status, error) {
			console.log(xhr);
		});*/
		
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
		//xhr.setRequestHeader('Content-Type','application/json');
		
		/*var oauthStr = 'OAuth ';
        oauthStr += 'oauth_consumer_key="' + parameters.oauth_consumer_key + '", ';
		oauthStr += 'oauth_token="' + parameters.oauth_token + '", ';
        oauthStr += 'oauth_signature_method="' + parameters.oauth_signature_method + '", ';
		oauthStr += 'oauth_signature="' + encodedSignature + '", ';
        oauthStr += 'oauth_timestamp="' + parameters.oauth_timestamp + '", ';
		oauthStr += 'oauth_nonce="' + parameters.oauth_nonce + '"';
		oauthStr += ', oauth_version="1.0a"';
		xhr.setRequestHeader('Authorization',oauthStr);*/
		
		//console.log(oauthStr);
		
		xhr.onload = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				console.log("Success!");
				//console.log(xhr);
				var results = JSON.parse(xhr.responseText);
				displayOnMap(results);
			}
		}
		
		xhr.onerror = function(response) {
			alert("Error in XHR");
			console.log(response);
		}
		xhr.send();
}

var nonceCounter = 0;
function genNonce() {
	var nonce = "" + nonceCounter;
	for(var i = nonce.length; i < 32; i++) {
		var c = Math.floor(Math.random() * 26);
		var caps = Math.random() > 0.5;
		nonce = String.fromCharCode(c + ((caps) ? 65 : 97)) + nonce;
	}
	nonceCounter++;
	return nonce;
}