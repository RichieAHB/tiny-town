function generateStars(count) {
	while (count--) {
		var size = Math.random() * 10;
		$('<div class="star">').appendTo($('.stars')).css({
			left: Math.random() * 100 + '%',
			opacity: Math.random(),
			height: size + 'px',
			top: Math.random() * 100 + '%',
			width: size + 'px',
		});
	}
}

function generateBuildings(count) {
	while (count--) {
		var size = (Math.random() * 100) + 150;
		var red = ((Math.round(Math.random()) * 2) + 3) + '' + (Math.round(Math.random()) * 9);
		var $roof = $('<div class="roof">').css({
			'border-color': 'transparent transparent #' + red + '1204 transparent',
			'border-width': '0 ' + (size / 2) + 'px ' + (size / 2) + 'px ' + (size / 2) + 'px'
		});
		$('<div class="building">').appendTo($('.tt__scroller--town')).css({
			backgroundColor: '#' + red + '1204',
			bottom: 0,
			left: Math.random() * 100 + '%',
			height: size * Math.random() + 'px',
			width: size + 'px'
		}).append($roof);
	}
}

function generateHills(count) {
	while (count--) {
		var size = (Math.random() * ($(window).height() / 2)) + ($(window).height() / 4);
		$('<div class="hill">').appendTo($('.tt__scroller--hills')).css({
			'border-width': '0 ' + size + 'px ' + (size / 2) + 'px ' + size + 'px',
			left: ((Math.random() * 150) - 25) + '%',
			height: size * Math.random() + 'px',
			opacity: Math.random() * 0.5 + 0.5,
			width: size + 'px'
		});
	}
}

generateStars(100);
generateBuildings(30);
generateHills(30);

$('#tt').tinyTown({
	syncedElements: [
		{
			selector: '.celestial-bodies',
			animations: [{
				type: 'rotate',
				keyframes: {
					0: 0,
					1: -180
				}
			}]
		},{
			selector: '.tt__static',
			animations: [{
				type: 'background-color',
				keyframes: {
					0: '#ddeeff',
					1: '#112233'
				}
			}]
		},{
			selector: '.moon',
			animations: [{
				type: 'background-color',
				keyframes: {
					0: '#ddeeff',
					1: '#112233'
				}
			}]
		},{
			selector: '.car',
			animations: [{
				type: 'right',
				keyframes: {
					0: 0,
					1: 'out'
				}
			}]
		},{
			selector: '.balloon',
			animations: [{
				type: 'up',
				keyframes: {
					0.4: 0,
					0.6: 'out'
				}
			}]
		},{
			selector: '.stars',
			animations: [{
				type: 'opacity',
				keyframes: {
					0.6: 0,
					1: 1
				}
			}]
		}
	],
	navItemSelector: '.navigation a',
	scrollDuration: 1500,
	syncedScrollers: '.tt__scroller--sub'
});