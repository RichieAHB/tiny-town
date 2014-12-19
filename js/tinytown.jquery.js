;(function ( $, window, document, undefined ) {
	/**
	 * The plugin name
	 * @type {string}
	 */
	var pluginName = "tinyTown";

	/**
	 * The default values for the plugin
	 * @type {object}
	 */
	var defaults = {
		scroller: '#tt__scroller',
		scrollRatio: 0.25,
		scrollerSections: '.section',
		syncedScrollers: '.sub-scroller',
		syncedElements: false
	};

	/**
	 * The main settings for the plugin
	 * @type {object}
	 */
	var settings;

	/**
	 * A reference to the plugin for use inside event handlers
	 * @type {self}
	 */
	var self;

	/**
	 * The main container for the plugin
	 * @type {jQuery object}
	 */
	var $container;

	/**
	 * The main scroller for the plugin
	 * @type {jQuery object}
	 */
	var $scroller;

	/**
	 * A list of the sections in the main scroller
	 * @type {jQuery object}
	 */
	var $scrollerSections;

	/**
	 * The maximum amount in pixels that the main scroller can translate
	 * @type {jQuery integer}
	 */
	var maxScroll;

	/**
	 * The current scroll position in pixels that the main scroller has translated
	 * @type {jQuery integer}
	 */
	var currentScrollPos = 0;

	/**
	 * The current scroll position as a percentage of the maxScroll
	 * @type {jQuery integer}
	 */
	var xPc = 0;

	/**
	 * The last Y position that a touch event was registed, for touch deltas
	 * @type {integer}
	 */
	var lastPageY = 0;

	/**
	 * The Tiny Town plugin
	 * @constructor
	 */
	function Plugin( element, options ) {
		self = this;

		$container = $(element);
		settings = $.extend( {}, defaults, options);

		$scroller = $container.find(settings.scroller);
		$scrollerSections = $scroller.find(settings.scrollerSections);
		$syncedScrollers = $container.find(settings.syncedScrollers);
		$navItems = $(settings.navItemSelector);

		self._defaults = defaults;
		self._name = pluginName;

		self.init();
	}

	Plugin.prototype = {

		/**
		 * The main function to run when the plugin is constructed
		 */
		init: function() {
			self.setMaxScroll();
			self.addScrollerHandler();
			self.addClickHandler();
			self.addTouchHandler();
		},

		/**
		 * Sets the global maxscroll variable that for the main scroller
		 */
		setMaxScroll: function() {
			maxScroll = -($scrollerSections.length - 1) * $container.width();
		},

		/**
		 * Adds the touche handler
		 */
		addTouchHandler: function() {
			$container.on('touchstart', function(e){
				lastScreenY = e.originalEvent.touches[0].screenY;
			});
		},

		/**
		 * Adds the mousewheel / touch handler
		 */
		addScrollerHandler: function(e) {
			$container.on('DOMMouseScroll mousewheel touchmove', function(e){
				e.preventDefault();
				requestAnimationFrame(function(){
					self.updatePositions(e);
					self.animate();
				});
			});
		},

		/**
		 * The wrapper function that runs all of the animations based on the relevant global variables 
		 */
		animate: function() {
			self.updatePositions();
			self.translateScrollers();
			self.updateSyncedElements();
			self.runTriggers();
		},

		/**
		 * Add the click handler 
		 */
		addClickHandler: function() {
			$navItems.click(function(e){
				e.preventDefault();
				var index = $(this).index();
				self.scrollToSection(index);
			});
		},

		/**
		 * Animates to the specified section
		 * @param {integer} index - the index of the section to scroll to
		 */
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

		/**
		 * Translates both the main scroller and any synced scrollers
		 */
		translateScrollers: function() {
			$scroller.css({
				transform: 'translate3d(' + currentScrollPos + 'px,0,0)'
			});

			$syncedScrollers.each(function(){
				$el = $(this);
				var ratio = ($el.width() - $container.width()) / -maxScroll;
				var translateAmount = currentScrollPos * ratio;
				$el.css({
					transform: 'translate3d(' + translateAmount + 'px,0,0)'
				});
			});
		},

		/**
		 * Updates the global position variables
		 * @param {event} [e] - the event that triggers a translate, not supplied when using the animate function
		 */
		updatePositions: function(e) {
			var scrollDelta = e ? self.getScrollDelta(e) : 0;
			currentScrollPos = Math.min(0, Math.max(maxScroll, scrollDelta + currentScrollPos));
			xPc = currentScrollPos / maxScroll;
		},

		/**
		 * Updates all the synced elements and their respective CSS properties based on the current scroll position
		 */
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
					var startTranslate = syncEl.startSection ? -((syncEl.startSection - 1) * $scrollerSections.width()) : 0;

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

		/**
		 * @param {object} $el - jQuery
		 * @param {object} a - animation object
		 * @returns {number|string} a number representing scale/translate factors or a string representing a colour
		 */
		getAnimationValue: function($el, a) {
			var k = a.keyframes;
			var closestKs = self.getClosestValues(k, xPc);
			var k1 = closestKs[0] || closestKs[1];
			var k2 = closestKs[1] || closestKs[0];
			var duration = k2 - k1 || 1; // Don't return NaN / Infinity

			var easing = k[k1].easing || 'linear';
			var startValue = typeof k[k1].value !== 'undefined' ? k[k1].value : k[k1];
			if (startValue === 'out') {
				startValue = self.getOutDistance($el, a.type);
			}

			var endValue = typeof k[k2].value !== 'undefined' ? k[k2].value : k[k2];
			if (endValue === 'out') {
				endValue = self.getOutDistance($el, a.type);
			}

			var newPc = Math.min(Math.max(xPc - k1, 0), 1);
			if (['color', 'background-color'].indexOf(a.type) >= 0) {
				return self.getIntermediaryColor(newPc, startValue, endValue, duration);
			} else {
				endValue = endValue - startValue;
				return self.easings[easing](newPc, startValue, endValue, duration);
			}
		},

		/**
		 * Gets the closest numeric keys in an array to the specified number
		 * @param {array} a - the array with numeric keys to search
		 * @param {number} x - the number to compare the keys to
		 * @returns {array} two numeric array keys that are just below and just above the number repecitvely
		 */
		getClosestValues: function(a, x) {
		    var lo, hi;
		    for (key in a) {
		        if (key <= x && (lo === undefined || lo < key)) lo = key;
		        if (key >= x && (hi === undefined || hi > key)) hi = key;
		    }
		    return [lo, hi];
		},

		/**
		 * Loops through all triggers, runs them if appropropriate before removing them from the array of triggers
		 */
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

		/**
		 * @param {event} e - the event on the container
		 * @return {integer} - the delta in pixels to move the container
		 */
		getScrollDelta: function(e) {
			if (e.originalEvent.touches) {
				scrollDelta = e.originalEvent.touches[0].pageY - lastPageY;
        		lastPageY = e.originalEvent.touches[0].pageY;
        		return scrollDelta;
			} else {
				scrollDelta = parseInt(e.originalEvent.wheelDelta || -e.originalEvent.detail * 10);
				return scrollDelta * settings.scrollRatio;
			}
		},

		/**
		 * Get the distance required to move an element out of the bounds of the container in a specific direction
		 * @param {jQuery object} $el - the element to test
		 * @param {string} dir - the direction to measure
		 * @returns {integer} the distance in pixels
		 */
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

		/**
		 * Takes rgb component and converts it to hexadecimal equivalent
		 * @param {integer} c - rgb component
		 * @retunrs {string} the hexadecimal component
		 */
		componentToHex: function(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		},

		/**
		 * Converts an rgb color into an hexadecimal color
		 * @param {integer} r - the red component
		 * @param {integer} g - the green component
		 * @param {integer} b - the blue component
		 * @returns {string} - the hexadecimal string
		 */
		rgbToHex: function(r, g, b) {
			return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
		},

		/** 
		 * Converts an hexadecimal color into and rgb color
		 * @param {string} hex - an hexadecimal color
		 * @returns {object} - and object containing the rgb components
		 */
		hexToRgb: function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},

		/**
		 * Returns a linear interpolation of two colours given a position along a duration
		 * @param {number} position - the position along the duration
		 * @param {string} color1 - the inital hexadecimal color
		 * @param {string} color1 - the final hexadecimal color
		 * @param {number} duration - the max position value
		 */
		getIntermediaryColor: function(position, color1, color2, duration) {
			c1 = self.hexToRgb(color1);
			c2 = self.hexToRgb(color2);
			r = Math.round(c1.r + (c2.r-c1.r) * (position / duration));
			g = Math.round(c1.g + (c2.g-c1.g) * (position / duration));
			b = Math.round(c1.b + (c2.b-c1.b) * (position / duration));
			return self.rgbToHex(r, g, b);
		}
	};

	/*
	 * Adds the plugin to the jQuery namespace
	 * @function
	 */
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
				new Plugin( this, options ));
			}
		});
	};

})( jQuery, window, document );