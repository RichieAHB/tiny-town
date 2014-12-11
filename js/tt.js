;(function ( $, window, document, undefined ) {
	var pluginName = "tinyTown";
	var defaults = {
		scroller: '.tt__scroller',
		scrollRatio: 0.25,
		sections: '.tt__section',
		syncedAnimations: false
	};

	var settings;
	var self;
	var $w = $(window);
	var $container;
	var $scroller;
	var $sections;
	var syncedAnimations;
	var maxScroll;
	var currentScrollPos = 0;
	var lastPageY;

	function Plugin( element, options ) {
		self = this;

		$container = $(element);
		settings = $.extend( {}, defaults, options);

		$scroller = $container.find(settings.scroller);
		$sections = $scroller.find(settings.sections);
		$syncedScrollers = $container.find(settings.syncedScrollers);
		syncedAnimations = settings.syncedAnimations;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			this.setDimensions();
			this.addScrollerHandler();
		},

		setDimensions: function() {
			maxScroll = -($sections.length - 1) * $container.width();
		},

		addScrollerHandler: function(e) {
			$container.on('DOMMouseScroll mousewheel touchmove', function(e){
				e.preventDefault();
				var scrollDelta = self.getScrollDelta(e);
				currentScrollPos = Math.min(0, Math.max(maxScroll, scrollDelta + currentScrollPos));
				var scrollPercentage = currentScrollPos / maxScroll;

				$scroller.css({
					transform: 'translate3d(' + currentScrollPos + 'px,0,0)'
				});

				for (var i = syncedAnimations.length - 1; i >= 0; i--) {
					var syncedAnimation = syncedAnimations[i];
					var css = {};
					var transformString = '';
					var translateX = 0;
					var translateY = 0;
					var $element = $container.find(syncedAnimation.selector);

					// Run through animations array and check for animation types
					for (var j = syncedAnimation.animations.length - 1; j >= 0; j--) {
						var animation = syncedAnimation.animations[j];
						var startPercentage = animation.startPercentage || 0;
						var endPercentage = animation.endPercentage || 1;

						var newPercentage = (scrollPercentage - startPercentage) * (1 / (endPercentage - startPercentage));
						if (animation.type == 'rotate') {
							var deg;
							animation.start = animation.start || 0;
							if (scrollPercentage <= startPercentage) {
								deg = animation.start;
							} else if (scrollPercentage > startPercentage && scrollPercentage < endPercentage) {
								deg = ((animation.end - animation.start) * newPercentage) + animation.start;
							} else {
								deg = animation.end;
							}
							transformString += 'rotate(' + deg + 'deg) ';
						} else if (animation.type == 'background-color') {
							var color = self.getIntermediaryColor(animation.start, animation.end, newPercentage);
							css.backgroundColor = color;
						} else if ((animation.type == 'right' || animation.type == 'left') && !syncedAnimation.xFunction) {
							var outDistance = self.getOutDistance($element, animation.type);
							if (scrollPercentage <= startPercentage) {
								translateX = '0px';
							} else if (scrollPercentage > startPercentage && scrollPercentage < endPercentage) {
								translateX = (outDistance * newPercentage) + 'px';
							} else {
								translateX = outDistance + 'px';
							}
						} else if ((animation.type == 'down' || animation.type == 'up') && !syncedAnimation.yFunction) {
							var outDistance = self.getOutDistance($element, animation.type);
							if (scrollPercentage <= startPercentage) {
								translateY = '0px';
							} else if (scrollPercentage > startPercentage && scrollPercentage < endPercentage) {
								translateY = (outDistance * newPercentage) + 'px';
							} else {
								translateY = outDistance + 'px';
							}
						}
					}

					// Check for custom functions on x or y translate position
					if (syncedAnimation.xFunction || syncedAnimation.yFunction) {
						var startTranslate = syncedAnimation.startSection ? -((syncedAnimation.startSection - 1) * $sections.width()) : 0;

						if (syncedAnimation.xFunction && currentScrollPos < startTranslate) {
							translateX = syncedAnimation.xFunction(scrollPercentage);
						}

						if (syncedAnimation.yFunction && currentScrollPos < startTranslate) {
							translateY = syncedAnimation.yFunction(scrollPercentage);
						}
					}

					transformString += 'translate3d(' + translateX + ',' + translateY + ',0) ';

					css.transform = transformString;

					$container.find(syncedAnimation.selector).css(css);
				}
			});
		},

		getScrollDelta: function(e) {
			if (e.touches) {
				scrollDelta = e.touches[0].pageY - lastPageY;
        		lastPageY = e.touches[0].page;
			} else {
				scrollDelta = parseInt(e.originalEvent.wheelDelta || -e.originalEvent.detail * 10);
			}
			return scrollDelta * settings.scrollRatio;
		},

		getOutDistance: function($element, direction) {
			if ($element.attr('data-out-distance-' + direction)) {
				return $element.attr('data-out-distance-' + direction);
			} else {
				var outDistance;
				if (direction == 'left') {
					outDistance = -($element.offset().left + $element.outerWidth());
				} else if (direction == 'right') {
					outDistance = $container.outerWidth() - $element.offset().left;
				} else if (direction == 'up') {
					outDistance = -($element.offset().top + $element.outerHeight());
				} else if (direction == 'down') {
					outDistance = $container.outerHeight() - $element.offset().top;
				}
				$element.attr('data-out-distance-' + direction, outDistance);
				return outDistance;
			}
		},

		componentToHex: function(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		},

		rgbToHex: function(r, g, b) {
			return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
		},

		hexToRgb: function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},

		getIntermediaryColor: function(color1, color2, percentage) {
			c1 = this.hexToRgb(color1);
			c2 = this.hexToRgb(color2);
			r = Math.round(c1.r + (c2.r-c1.r) * percentage);
			g = Math.round(c1.g + (c2.g-c1.g) * percentage);
			b = Math.round(c1.b + (c2.b-c1.b) * percentage);
			return this.rgbToHex(r, g, b);
		}
	};

	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
				new Plugin( this, options ));
			}
		});
	};

})( jQuery, window, document );

/*
 * Plugin Setup
 */

$('#tt').tinyTown({
	syncedAnimations: [{
		selector: '.celestial',
		animations: [{
			type: 'rotate',
			end: -180
		}]
	},{
		selector: '.tt__static',
		animations: [{
			type: 'background-color',
			start: '#ddeeff',
			end: '#112233'
		}]
	},{
		selector: '.car',
		animations: [{
			type: 'right',
			end: 'out'
		}]
	},{
		selector: '.balloon',
		animations: [{
			type: 'up',
			end: 'out',
			startPercentage: 0.5,
			endPercentage: 0.6
		}]
	}]
});