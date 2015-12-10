"use strict";

function SQLAgent(map) {
	this.map = map;
};

SQLAgent.prototype.randomPrice = function(range) {
	var price;
	switch(range) {
	case 1:
		price = Math.random() * 10;
		break;
	case 2:
		price = (Math.random() * 20) + 10;
		break;
	case 3:
		price = (Math.random() * 30) + 30;
		break;
	case 4:
		price = (Math.random() * 40) + 60;
		break;
	default:
		price = (Math.random() * 50) + 10;
		break;
	}
	return '$' + price.toFixed(2);
}

SQLAgent.prototype.randomMenuItem = function(category) {
	var foods = ['hamburger','milkshake','fries','egg roll','pizza','noodles'];
	return { 
		name: foods[Math.floor(Math.random() * foods.length)]
	  , description: 'yum'
	  , price: this.randomPrice(Math.floor(Math.random() * 5 + 1)) 
	};
}

SQLAgent.prototype.randomWeek = function() {
	function randomHours() {
		return {
			'open' : Math.floor(Math.random() * 6 + 7)
		  , 'close': Math.floor(Math.random() * 6 + 17)
		};
	}
	
	return [
		{ weekday : 'monday',    hours : randomHours() }
	  , { weekday : 'tuesday',   hours : randomHours() }
	  , { weekday : 'wednesday', hours : randomHours() }
	  , { weekday : 'thursday',  hours : randomHours() }
	  , { weekday : 'friday',    hours : randomHours() }
	  , { weekday : 'saturday',  hours : randomHours() }
	  , { weekday : 'sunday',    hours : randomHours() }
	];
}

SQLAgent.prototype.randomStr = function(len) {
	var poss = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	var str = '';
	for(var i = 0;i < len;i++)
		str += poss.charAt(Math.floor(Math.random() * poss.length));
	return str;
}

SQLAgent.prototype.randomUser = function() {
	var dists = [ 2, 5, 10, 25 ];
	return {
		username : this.randomStr(10),
		passwd : this.randomStr(10),
		dist : dists[Math.floor(Math.random() * dists.length)],
		price : Math.floor(Math.random() * 3 + 1)
	}
}

SQLAgent.prototype.randomReview = function() {
	return {
		rating : Math.floor(Math.random() * 51) / 10,
		review : 'yum'
	};
}

SQLAgent.prototype.request = function(params,meta) {
	var httpMethod = 'GET';

	var queryString = '';
	for(var param in params) {
		queryString += param + '=' + params[param] + '&';
	}
	queryString += "limit=20";
    
	var proxyurl = 'js/yelp_api_proxy.php';
	var proxyQuery = proxyurl + '?url=' + encodeURIComponent('v2/search?' + queryString);
	//console.log(proxyQuery);
	
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
			//console.log(results);
			meta.results.push(results);
			meta.done[params.category_filter] = true;
		}
	}
	xhr.onerror = function(response) {
		alert("Error in XHR");
	}
	xhr.send();
}

SQLAgent.prototype.process = function(results,meta) {
	//console.log(results.businesses);
	for(var i = 0;i < results.businesses.length;i++) {
		//console.log(i);
		var id = meta.counter;
		meta.counter++;
		var business = results.businesses[i];

		var address = meta.me.addressSQL(id,business.location);
		var loc = meta.me.locationSQL(id, business.location);
		var rest = meta.me.restaurantSQL(id,business);
		var spec = meta.me.specializesSQL(id,meta.categories.indexOf(business.categories[0][1]));
		var offers = meta.me.offersSQL(id,Math.floor(Math.random() * meta.features.length));
		var _open = '';
		var week = meta.me.randomWeek();
		for(var j = 0;j < week.length - 1;j++)
			_open += meta.me.openSQL(id,week[j]) + ',';
		_open += meta.me.openSQL(id,week[week.length - 1]);
		
		meta.sql.address += address + ',';
		meta.sql.location += loc + ',';
		meta.sql.restaurant += rest + ',';
		meta.sql.specializes += spec + ',';
		meta.sql.offers += offers + ',';
		meta.sql.open += _open + ',';
	}
	//console.log('yea');
}

SQLAgent.prototype.populate = function() {
	var relations = {
		address     : 'Address(id,streetAddress,city,region,zip)'
	  , 'location'  : 'Location(id,latitude,longitude)'
	  , restaurant  : 'Restaurant(id,[name],avgRating,website,address,location)'
	  , category    : 'Category(id,[name])'
	  , specializes : 'Specializes(restaurant,category)'
	  , feature		: 'Feature(id,[name])'
	  , offers		: 'Offers(restaurant,feature)'
	  , menuItem	: 'MenuItem(id,[name],restaurant,description,price)'
	  , describes	: 'Describes(category,food)'
	  , 'open'		: '[Open](restaurant,weekday,openTime,closeTime)'
	  , user		: '[User](username,passwd,preferredDist,preferredPrice)'
	  , review		: 'Review(id,rating,review)'
	};
	for(var relation in relations)
		relations[relation] = 'INSERT INTO ' + relations[relation] + ' VALUES ';
	
	var latlng = { lat : map.initialLocation.lat(), lng : map.initialLocation.lng() },
		radius = 25 * 1609.34;
	
	var cat_done = {};
	var categories = [];
	var i = 0;
	var me = this;
	$('#category option').each(function() {
		var cat = $(this).attr('value');
		cat_done[cat] = false;
		categories.push(cat);
		relations.category += me.categorySQL(i,cat) + ',';
		i++;
	});
	
	var features = [ 'bar', 'outdoor seating', 'open late', 'delivery' ];
	for(var i = 0;i < features.length;i++)
		relations.feature += this.featureSQL(i,features[i]) + ',';
	
	var meta = {
		lock: false,
		counter : 0,
		done : cat_done,
		features : features,
		categories : categories,
		me : me,
		sql : relations,
		results : []
	};
	
	function loop(index) {
		if(index >= categories.length)
			return;
		//console.log(categories[index]);
		var params = { 
			term : 'restaurants',
			ll : latlng.lat + ',' + latlng.lng,
			category_filter : categories[index],
			radius_filter : radius
		};
		meta.me.request(params,meta);
		setTimeout(function() { loop(index + 1); }, 500);
	}
	loop(0);
	
	var users = [];
	for(var i = 0;i < 30;i++) {
		users.push(this.randomUser());
		relations.user += this.userSQL(users[i]) + ',';
	}
	
	function wait() {
		var sync = true;
		//console.log(meta);
		for(var cat in meta.done) {
			if(!meta.done[cat]) { sync = false; break; }
		}
		if(!sync) { setTimeout(wait,500); }
		else { finish(); }
	}
	
	wait();
	function finish() {
		console.log('begin');
		for(var i = 0;i < meta.results.length;i++)
			meta.me.process(meta.results[i],meta);
		
		for(var i = 0; i < 200; i++) {
			relations.menuItem += meta.me.menuItemSQL(i
			,Math.floor(Math.random() * meta.counter),meta.me.randomMenuItem()) + ',';
			
			relations.describes += 
			meta.me.describesSQL(Math.floor(Math.random() * meta.categories.length),i) + ',';
			
			relations.review += 
				meta.me.reviewSQL(i, users[Math.floor(Math.random() * 30)].username
								   , Math.floor(Math.random() * meta.counter)
			,(Math.random() < 0.5) ? Math.floor(Math.random() * meta.counter) : 'NULL'
			, meta.me.randomReview()) + ',';
		}
		
		for(var relation in relations) {
			relations[relation] = relations[relation].slice(0,-1) + ';';
			console.log(relations[relation]);
		}
	}
}

SQLAgent.prototype.addressSQL = function(id, loc) {
	var sql = '(';
	sql += id;
	sql += ',' + '"' + loc.address + '"';
	sql += ',' + '"' + loc.city + '"';
	sql += ',' + '"' + loc.state_code + '"';
	sql += ',' + loc.postal_code;
	sql += ')';
	return sql;
}

SQLAgent.prototype.locationSQL = function(id, loc) {
	var sql = '(';
	sql += id;
	sql += ',' + loc.coordinate.latitude;
	sql += ',' + loc.coordinate.longitude;
	sql += ')';
	return sql;
}

SQLAgent.prototype.restaurantSQL = function(id, business) {
	var sql = '(';
	sql += id;
	sql += ',' + '"' + business.name + '"';
	sql += ',' + business.rating;
	sql += ',' + '"' + business.url + '"';
	sql += ',' + id;
	sql += ',' + id;
	sql += ')';
	return sql;
}

SQLAgent.prototype.categorySQL = function(id, name) {
	return '(' + id + ',"' + name + '")';
}

SQLAgent.prototype.specializesSQL = function(restID, catID) {
	return '('+ + restID + ',' + catID + ')';
}

SQLAgent.prototype.featureSQL = function(id, name) {
	return '(' + id + ',"' + name + '")';
}

SQLAgent.prototype.offersSQL = function(restID, featID) {
	return '(' + restID + ',' + featID + ')';
}

SQLAgent.prototype.menuItemSQL = function(id, restID, menuItem) {
	var sql = '(';
	sql += id;
	sql += ',' + '"' + menuItem.name + '"';
	sql += ',' + restID;
	sql += ',' + '"' + menuItem.description + '"';
	sql += ',' + menuItem.price;
	sql += ')';
	return sql;
}

SQLAgent.prototype.describesSQL = function(catID, foodID) {
	return '(' + catID + ',' + foodID + ')';
}

SQLAgent.prototype.openSQL = function(restID, hours) {
	var sql = '(';
	sql += restID;
	sql += ',' + '"' + hours.weekday + '"';
	sql += ',' + hours.hours.open;
	sql += ',' + hours.hours.close;
	sql += ')';
	return sql;
}

SQLAgent.prototype.userSQL = function(user) {
	var sql = '(';
	sql += '"' + user.username + '"';
	sql += ',' + '"' + user.passwd + '"';
	sql += ',' + user.dist;
	sql += ',' + user.price;
	sql += ')';
	return sql;
}

SQLAgent.prototype.reviewSQL = function(id, username, restID, foodID, review) {
	var sql = '(';
	sql += id;
	sql += ',' + review.rating;
	sql += ',' + '"' + review.review + '"';
	sql += ',' + '"' + username + '"';
	sql += ',' + foodID;
	sql += ',' + restID;
	sql += ')';
	return sql;
}

SQLAgent.prototype.updateDB = function(query) {
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() 
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
        {
            document.getElementById("print").innerHTML = xmlhttp.responseText;
        }
    };
    xmlhttp.open("GET","SelectDB.php?sql="+query,true);
    xmlhttp.send();
}

SQLAgent.prototype.selectFromDB = function(query,callback) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
        {
            callback(JSON.parse(xmlhttp.responseText));
        }
    };
    xmlhttp.open("GET","SelectDB.php?sql="+encodeURI(query),true);
    xmlhttp.send();
}

SQLAgent.prototype.updateAttributes = function() {
	var sql = 'SELECT * FROM Location;';
	this.selectFromDB(sql,callback);
	function callback(locations) {
		sql = '';
		for(var i = 0;i < results.length;i++) {
			sql += 'UPDATE Location SET distFromUser='
			var dist = google.maps.geometry.spherical.computeDistanceBetween(
			this.map.initialLocation
			,new google.maps.LatLng(locations[i]['latitude'],locations[i]['longitude']).toFixed(2);
			sql += dist + ' WHERE id=' locations[i]['id'] + ';';
		}
		
		sql += ' WITH avgPrices AS (SELECT r2.id,AVG(price) AS avgPrice';
		sql += ' FROM MenuItem AS m JOIN Restaurant AS r2 ON m.restaurant=r2.id)';
		sql += ' UPDATE r1 SET avgPrice=avgPrices.avgPrice';
		sql += ' FROM Restaurant r1 JOIN avgPrices ON r1.id = avgPrices.id';
		this.updateDB(sql);
	}
}

SQLAgent.prototype.passRequest = function(params,rating) {
	var sql = 'SELECT * FROM Restaurant AS r';
	sql 	+='((JOIN Specializes AS s ON s.restaurant=r.id) JOIN Category AS c ON c.id=s.category)';
	sql		+=' JOIN Location AS l WHERE l.id=r.location WHERE ';
	sql		+=' c.[name]="' + params.category_filter + '"';
	sql		+=' AND l.distanceFromUser<=' + params.radius_filter;
	sql		+=' AND r.avgRating>=' + rating + ';';
	this,selectFromDB(sql,callback);
	function callback(results){
		map.displaySQL(results);
	}
}