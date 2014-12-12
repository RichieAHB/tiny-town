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

generateStars(100);

$('#tt').tinyTown({
	syncedElements: [
		{
			selector: '.celestial-bodies',
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
			selector: '.moon',
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
				startPercentage: 0.4,
				endPercentage: 0.6
			}]
		},{
			selector: '.stars',
			animations: [{
				type: 'opacity',
				start: 0,
				end: 1,
				startPercentage: 0.6,
				endPercentage: 1
			}]
		}
	],
	syncedTriggers: [
		{
			percentage: 0.5,
			trigger: function() {
				$('.car').addClass('rotate');
			}
		}
	],
	navItemSelector: '.navigation a'
});