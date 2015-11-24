var map;
var infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.083848, lng: -77.6799},
    zoom: 16,
	mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  //map.mapTypeId = 'satellite';
  //map.setTilt(45);
}

function addMarker(latitude,longitude,title) {
	var position = {lat: latitude, lng: longitude};
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