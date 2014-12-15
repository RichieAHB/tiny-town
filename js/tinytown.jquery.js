;(function ( $, window, document, undefined ) {
	var pluginName = "tinyTown";
	var defaults = {
		scroller: '.tt__scroller',
		scrollRatio: 0.25,
		sections: '.section',
		syncedElements: false
	};

	var settings;
	var self;
	var $w = $(window);
	var $container;
	var $scroller;
	var $sections;
	var maxScroll;
	var currentScrollPos = 0;
	var xPc = 0;
	var lastPageY;

	function Plugin( element, options ) {
		self = this;

		$container = $(element);
		settings = $.extend( {}, defaults, options);

		$scroller = $container.find(settings.scroller);
		$sections = $scroller.find(settings.sections);
		$syncedScrollers = $container.find(settings.syncedScrollers);
		$navItems = $(settings.navItemSelector);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			this.setMaxScroll();
			this.addScrollerHandler();
			this.addClickHandler();
		},

		setMaxScroll: function() {
			maxScroll = -($sections.length - 1) * $container.width();
		},

		addScrollerHandler: function(e) {
			$container.on('DOMMouseScroll mousewheel touchmove', function(e){
				e.preventDefault();
				requestAnimationFrame(function(){
					self.updatePositions(e);
					self.animate();
				});
			});
		},

		animate: function() {
			self.updatePositions();
			self.scrollContainer();
			self.updateSyncedElements();
			self.runTriggers();
		},

		addClickHandler: function() {
			$navItems.click(function(e){
				e.preventDefault();
				var index = $(this).index();
				self.scrollToSection(index);
			});
		},

		scrollToSection: function(index) {
			var startPos = currentScrollPos;
			var endPos = -$container.width() * index;
			var delta = endPos - startPos;
			var startTime = Date.now();
			var easing = settings.scrollEasing || 'easeInOutQuad';
			var timer = setInterval(function(){
				var t = Date.now() - startTime;
				if (t > settings.scrollDuration) {
					clearInterval(timer);
				} else {
					currentScrollPos = self.easings[easing](t, startPos, delta, settings.scrollDuration);
					self.animate();
				}
			});
		},

		easings: {
			linear: function(t, b, c, d) {
				return c*t/d + b;
			},
			easeInOutQuad: function (t, b, c, d) {
				t /= d/2;
				if (t < 1) return c/2*t*t + b;
				t--;
				return -c/2 * (t*(t-2) - 1) + b;
			}
		},

		scrollContainer: function() {
			$scroller.css({
				transform: 'translate3d(' + currentScrollPos + 'px,0,0)'
			});
		},

		updatePositions: function(e) {
			var scrollDelta = e ? self.getScrollDelta(e) : 0;
			currentScrollPos = Math.min(0, Math.max(maxScroll, scrollDelta + currentScrollPos));
			xPc = currentScrollPos / maxScroll;
		},

		updateSyncedElements: function() {
			for (var i = settings.syncedElements.length - 1; i >= 0; i--) {
				var syncEl = settings.syncedElements[i];
				var css = {};
				var transform = '';
				var x = 0;
				var y = 0;
				var $element = $container.find(syncEl.selector);

				// Run through animations array and check for animation types
				for (var j = syncEl.animations.length - 1; j >= 0; j--) {
					var a = syncEl.animations[j];


					if (a.type == 'rotate') {
						var deg = self.getAnimationValue($element, a);
						transform += 'rotate(' + deg + 'deg) ';
					} else if (a.type == 'opacity') {
						var value = self.getAnimationValue($element, a);
						css.opacity = value;
					} else if (a.type == 'background-color') {
						css.backgroundColor = self.getAnimationValue($element, a);
					} else if ((a.type == 'right' || a.type == 'left') && !syncEl.xFunction) {
						x = self.getAnimationValue($element, a) + 'px';
					} else if ((a.type == 'down' || a.type == 'up') && !syncEl.yFunction) {
						y = self.getAnimationValue($element, a) + 'px';
					}
				}

				// Check for custom functions on x or y translate position
				if (syncEl.xFunction || syncEl.yFunction) {
					var startTranslate = syncEl.startSection ? -((syncEl.startSection - 1) * $sections.width()) : 0;

					if (syncEl.xFunction && currentScrollPos < startTranslate) {
						x = syncEl.xFunction(xPc);
					}

					if (syncEl.yFunction && currentScrollPos < startTranslate) {
						y = syncEl.yFunction(xPc);
					}
				}

				transform += 'translate3d(' + x + ',' + y + ',0) ';
				css.transform = transform;
				$container.find(syncEl.selector).css(css);
			}
		},

		getAnimationValue: function($el, a) {
			var k = a.keyframes;
			var closestKs = this.getClosestValues(k, xPc);
			var k1 = closestKs[0] || closestKs[1];
			var k2 = closestKs[1] || closestKs[0];
			var duration = k2 - k1 || 1; // Don't return NaN / Infinity

			var easing = k[k1].easing || 'linear';
			var startValue = k[k1].value || k[k1] || 0;
			if (startValue === 'out') {
				startValue = this.getOutDistance($el, a.type);
			}

			var endValue = k[k2].value || k[k2] || 100;
			if (endValue === 'out') {
				endValue = this.getOutDistance($el, a.type);
			}

			var newPc = Math.min(Math.max(xPc - k1, 0), 1);
			if (['color', 'background-color'].indexOf(a.type) >= 0) {
				return this.getIntermediaryColor(newPc, startValue, endValue, duration);
			} else {
				endValue = endValue - startValue;
				return this.easings[easing](newPc, startValue, endValue, duration);
			}
		},

		getClosestValues: function(a, x) {
		    var lo, hi;
		    for (key in a) {
		        if (key <= x && (lo === undefined || lo < key)) lo = key;
		        if (key >= x && (hi === undefined || hi > key)) hi = key;
		    }
		    return [lo, hi];
		},

		runTriggers: function() {
			if (settings.syncedTriggers) {
				var len = settings.syncedTriggers.length;
				while (len--) {
					var trigger = settings.syncedTriggers[len];
					if (trigger.percentage < xPc) {
						trigger.trigger();
						settings.syncedTriggers.splice(len, 1);
					}
				}
			}
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

		getOutDistance: function($el, dir) {
			if ($el.attr('data-out-distance-' + dir)) {
				return parseInt($el.attr('data-out-distance-' + dir), 10);
			} else {
				var dist;
				if (dir == 'left') {
					dist = -($el.offset().left + $el.outerWidth());
				} else if (dir == 'right') {
					dist = $container.outerWidth() - $el.offset().left;
				} else if (dir == 'up') {
					dist = -($el.offset().top + $el.outerHeight());
				} else if (dir == 'down') {
					dist = $container.outerHeight() - $el.offset().top;
				}
				$el.attr('data-out-distance-' + dir, dist);
				return dist;
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

		getIntermediaryColor: function(percentage, color1, color2, duration) {
			c1 = this.hexToRgb(color1);
			c2 = this.hexToRgb(color2);
			r = Math.round(c1.r + (c2.r-c1.r) * (percentage / duration));
			g = Math.round(c1.g + (c2.g-c1.g) * (percentage / duration));
			b = Math.round(c1.b + (c2.b-c1.b) * (percentage / duration));
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