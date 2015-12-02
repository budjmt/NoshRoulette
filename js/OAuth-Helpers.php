<?php

//function to build the base request string
function buildBaseString($baseURI, $method, $params) {
	$paramList = array(); //array to hold our query parameters
	ksort($params); //sort the keys of the array
    //for each param key:value, turn it into key=value
    //for the query parameters on the URL 
	foreach($params as $key=>$value){ 
        //add each encoded key=value string to the array
        $paramList[] = "$key=" . rawurlencode($value); 
	}
    
    //encode the method, baseURI and parameters together into one key1=value1&key2=value2... string
    //This string will be sent to the twitter API as the request
	return $method."&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $paramList));
}

//set the authorization headers for our app to identify itself 
function buildAuthorizationHeader($oauth) { 
	$authHeader = 'Authorization: OAuth '; //base auth header string
	$values = array(); //array for each authorization field
	foreach($oauth as $key=>$value) //for each of our oauth params, get the keys and values
	$values[] = "$key=\"" . rawurlencode($value) . "\"";
    //append all of our auth parameters to the base auth header string
	$authHeader .= implode(', ', $values);
	return $authHeader; //return final auth header string
}

?>