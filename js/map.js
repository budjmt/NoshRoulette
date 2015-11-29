"use strict";

var map;
var infoWindow;

var rochester;
var initialLocation;
var geoSupportFlag = true;

function initMap() {
	rochester = new google.maps.LatLng(43.083848, -77.6799);
  map = new google.maps.Map(document.getElementById('map'), {
	center: rochester,
    zoom: 16,
	mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  //w3c location stuff
  if(navigator.geolocation) {
    geoSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
	  addMarker(initialLocation,"You");
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

function addMarker(position,title) {
	var marker = new google.maps.Marker({position: position, map: map});
	marker.setTitle(title);
	google.maps.event.addListener(marker,'click',function(e) {
	makeInfoWindow(this.position,this.title);
	});
}

function makeInfoWindow(position,msg) {
	if(infoWindow) infoWindow.close();
	infoWindow = new google.maps.InfoWindow({
		map: map,
		position: position,
		content: '<b>' + msg + '</b>'
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