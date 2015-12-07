
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
				stars[i].onmouseover = starRating0;
				break;
			case 1:
				stars[i].onmouseover = starRating1;
				break;
			case 2:
				stars[i].onmouseover = starRating2;
				break;
			case 3:
				stars[i].onmouseover = starRating3;
				break;
			case 4:
				stars[i].onmouseover = starRating4;
				break;
		}
		
	}
}

function resetRating() {
	for(var i = 0; i < 5; i++){
		stars[i].children[0].src="css/yelp-star-bw.png";
	}
}

function starRating0(e){
	resetRating();
	for(var i = 0; i < 1; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}

function starRating1(e){
	resetRating();
	for(var i = 0; i < 2; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}
function starRating2(e){
	resetRating();
	for(var i = 0; i < 3; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}
function starRating3(e){
	resetRating();
	for(var i = 0; i < 4; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}
function starRating4(e){
	resetRating();
	for(var i = 0; i < 5; i++){
		stars[i].children[0].src="css/yelp-star.png";
	}
}