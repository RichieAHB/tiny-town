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
	scrollDuration: 1500
});