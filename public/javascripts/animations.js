$("#header2").hide();

var header = $("#header").offset().top; //gets offset of header
var height = $("#header").outerHeight(); //gets height of header

$(document).ready(function() {
	var status = 'top';
	var docHeight;

	$(window).scroll(function() {
		var $scrolltop = $(window).scrollTop();
		var $scrollBottom = $scrolltop + $(window).height();
		var $trigger2 = $('#trigger2').offset().top;
		docHeight = $(document).height();

		if($scrollBottom > $trigger2 + 1 && status == 'top') {
			$('html, body').stop().animate({
			   	scrollTop: docHeight
			}, 400, function() {
				status = 'bottom';
			});
			status = undefined;
		}

		if($scrolltop < $trigger2 - 1 && status == 'bottom') {
			$('html, body').stop().animate({
			   scrollTop: 0
			}, 400, function() {
				status = 'top';
			});
			status = undefined;
		}
	});

	$('#toTop').click(function() {
		$('html, body').stop().animate({
		   scrollTop: $trigger2
		}, 400, function() {
			status = 'top';
		});
		status = undefined;
	})

	$('#toBottom').click(function() {
		if(!$('#toBottom').hasClass('inactive')) {
			$('html, body').stop().animate({
			   scrollTop: docHeight
			}, 400, function() {
				status = 'bottom';
			});
			status = undefined;
		}
	})
});

