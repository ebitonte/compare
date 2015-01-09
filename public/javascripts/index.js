var leftMap;
var rightMap;
var leftPano = $('leftPano');
var rightPano = $('rightPano');
var locationList;
var controller;
var scene;
var scene2;
var sv = new google.maps.StreetViewService();

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
       	displayArticle(goToStreetView);
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

function displayArticle(callback) {
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
	textSearch(1, locationList[articleNum].city, callback);
	if(locationList[articleNum].related.length > 0) {
		hasURL();
		$('#iframe').attr('src', locationList[articleNum].related[0].url);
	} else {
		noURL();
	}
	setArticleTitle(locationList[articleNum]);
}

/**
* 
* side: 0 = leftSide, 1 = rightSide
*/
function textSearch(side, place, callback) {
	var request = {
		query: place
	};
	var sideMap = side ? rightMap : leftMap;
	service = new google.maps.places.PlacesService(sideMap);
	service.textSearch(request, function(results, status) {
       	console.log(status);
       	console.log(results);
       	if (status == google.maps.places.PlacesServiceStatus.OK) {
           	 displayMap(true, results[0], callback);
       	}
    });
}

/**
* display map -
* 	side: 0 = leftSide, 1 = rightSide
*/

function displayMap(side, location, callback) {
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
	callback(true);
}

function goToStreetView(both) {
	var places = ['secondary school', 'hospital', 'grocery store', 'gas station', 'church'];
	var shuffled = shuffle(places);
	var right_request = {
		location: rightMap.getCenter(),
		query : shuffled[0],
		radius : '50'
	};
	var left_request = {
		location : leftMap.getCenter(),
		query : shuffled[0],
		radius : '50'
	}
	$('#location').text(shuffled[0]);
	var serviceRight = new google.maps.places.PlacesService(rightMap);
	console.log(rightMap);
	serviceRight.textSearch(right_request, function(results, status) {
		console.log('STREET VIEW HAPPENING');
       	console.log(results);
       	if (status == google.maps.places.PlacesServiceStatus.OK) {
           	sv.getPanoramaByLocation(results[0].geometry.location, 100, function(data, status) {
           		console.log(status, data);
           		if(status == google.maps.StreetViewStatus.OK) {
           			console.log(data);
           			var rightPan = new google.maps.StreetViewPanorama(document.getElementById('rightMap'));
           			rightPan.setPano(data.location.pano);
           		}
           	});
			//var rightPan = new google.maps.StreetViewPanorama(document.getElementById('rightMap'), panoramaOptions);
			// var rightPan = rightMap.getStreetView();
			// rightPan.setVisible(true);
			// console.log(rightPan);
			// rightMap.setStreetView(rightPan);
			if(both) {
				var serviceLeft = new google.maps.places.PlacesService(leftMap);
			    serviceLeft.textSearch(left_request, function(left_results, left_status) {
					console.log('STREET VIEW HAPPENING');
			       	console.log(left_results);
			       	if (left_status == google.maps.places.PlacesServiceStatus.OK) {
			           	sv.getPanoramaByLocation(left_results[0].geometry.location, 100, function(left_data, lstatus) {
			           		console.log(lstatus, left_data);
			           		if(lstatus == google.maps.StreetViewStatus.OK) {
			           			var leftPan = new google.maps.StreetViewPanorama(document.getElementById('leftMap'));
			           			leftPan.setPano(left_data.location.pano);
			           		}
			           	});
			       	}
	    		});
			}
       	}
    });
}

function processSVData(data, status) {
	if (status == google.maps.StreetViewStatus.OK) {

	}
}

function shuffle(array) {
  	var m = array.length, t, i;
  	// While there remain elements to shuffle…
  	while (m) {
    	// Pick a remaining element…
    	i = Math.floor(Math.random() * m--);
    	// And swap it with the current element.
    	t = array[m];
    	array[m] = array[i];
    	array[i] = t;
  	}
  	return array;
}

function setArticleTitle(article) {
	$('#article-title').text(article.title);
}

function noURL() {
	if($('#topContainer').parent().hasClass('scrollmagic-pin-spacer')) {
		controller.removeScene([scene1, scene2]);
	}
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
	if(!$('#topContainer').parent().hasClass('scrollmagic-pin-spacer')) {
		scene = new ScrollScene({triggerElement: "#trigger1", triggerHook: "onLeave", duration: 1000})
						.setPin("#topContainer")
						.addTo(controller);

		scene2 = new ScrollScene({triggerElement: "#trigger2", triggerHook: 'onLeave', duration: 2000})
						.setPin("#bottomContainer")
						.addTo(controller);
	}
}

$('#last').click(function() {
	var num = $.cookie('articleNum', Number);
	if(num > 0) {
		$.cookie('articleNum', num - 1, {expires: .5});
		displayArticle(goToStreetView);
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
		displayArticle(goToStreetView);
	} 
	if(num + 1 == locationList.length) {
		$('.arrow.right').removeClass('active').addClass('inactive');
	}
});


