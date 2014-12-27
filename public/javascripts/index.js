var leftMap;
var rightMap;
var locationList;
var controller;

$(document).ready(function() {
	controller = new ScrollMagic();
	getLocation(function(location) {
		var leftOptions = {
            zoom: 9,
            center: location
        };
        leftMap = new google.maps.Map(document.getElementById('leftMap'),
            leftOptions);       	
	})
	$.ajax({
		url: 'http://um.media.mit.edu:5005/'
	})
	.done(function(result) {
		locationList = [];
		result.json_list.forEach(function(i) {
			var articleWithLocation = articleHasLocation(i);
			if(articleWithLocation) {
				locationList.push(articleWithLocation);
			}
       	});
		console.log(locationList);
		$.cookie('articleNum', 0, {expires: .5});
       	displayArticle();
	})
	.fail(function(err) {
		console.log(err);
	});
});

function getLocation(callback) {
    var location;
    navigator.geolocation.getCurrentPosition(function(position) {
    	console.log('nada');
        location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        callback(location);
    });
}

function articleHasLocation(article) {
	var hasLocation = false;
	for(var i = 0; i < article.entities.length; ++i) {
		if(article.entities[i].type == 'City') {
			hasLocation = true;
			article.city = article.entities[i].value;
			break;
		}
	}
	if(hasLocation) {
		return article;
	} else {
		return null;
	}
}

function textSearch(place) {
	var request = {
		query: place
	};
	service = new google.maps.places.PlacesService(rightMap);
	service.textSearch(request, function(results, status) {
       	console.log(status);
       	console.log(results);
       	if (status == google.maps.places.PlacesServiceStatus.OK) {
           	 displayMap(true, results[0]);
       	}
    });
}

/**
* display map -
* 	side: 0 = leftSide, 1 = rightSide
*/

function displayMap(side, location) {
	console.log(location);
	console.log(location.formatted_address);
	$('#rightLabel').text(location.formatted_address);
	var options = {
		zoom: 9,
		center: location.geometry.location
	};
	if(side) {
		rightMap = new google.maps.Map(document.getElementById('rightMap'),
       		options);
	} else {
		leftMap = new google.maps.Map(document.getElementById('leftMap'),
       		options);
	}
}

function displayArticle() {
	var articleNum = $.cookie('articleNum');
	console.log(articleNum);
	articleNum = articleNum ? articleNum : 0;
	console.log(articleNum);
	var center = new google.maps.LatLng(0,0);
	var rightOptions = {
		zoom: 1,
		center: center
	};
	rightMap = new google.maps.Map(document.getElementById('rightMap'),
    	rightOptions);
	textSearch(locationList[articleNum].city);
	if(locationList[articleNum].related.length > 0) {
		hasURL();
		$('#iframe').attr('src', locationList[articleNum].related[0].url);
	} else {
		noURL();
	}
	setArticleTitle(locationList[articleNum]);
}

function setArticleTitle(article) {
	$('#article-title').text(article.title);
}

function noURL() {
	$('#bottomContainer').hide();
	$('#bottomContainer').addClass('hidden');
	$('#bottomPinContain').hide();
	$('#bottom-arrow').removeClass('active').addClass('inactive');
}

function hasURL() {
	$('#bottomContainer').show();
	$('#bottomContainer').removeClass('hidden');
	$('#bottomPinContain').show();
	$('#bottom-arrow').removeClass('inactive').addClass('active');
	var scene = new ScrollScene({triggerElement: "#trigger1", triggerHook: "onLeave", duration: 1000})
					.setPin("#topContainer")
					.addTo(controller);

	var scene2 = new ScrollScene({triggerElement: "#trigger2", triggerHook: 'onLeave', duration: 2000})
					.setPin("#bottomContainer")
					.addTo(controller);
}

$('#last').click(function() {
	var num = $.cookie('articleNum', Number);
	if(num > 0) {
		$.cookie('articleNum', num - 1, {expires: .5});
		displayArticle();
		$('.arrow.right').removeClass('inactive').addClass('active');
	} 
	if(num - 1 == 0) {
		$('.arrow.left').removeClass('active').addClass('inactive');
	}
});

$('#next').click(function() {
	console.log('next click');
	var num = $.cookie('articleNum', Number);
	console.log(num);
	if(num < locationList.length) {
		console.log(locationList.length);
		$('.arrow.left').removeClass('inactive').addClass('active');
		$.cookie('articleNum', num + 1, {expires: .5});
		displayArticle();
	} 
	if(num + 1 == locationList.length) {
		$('.arrow.right').removeClass('active').addClass('inactive');
	}
});


