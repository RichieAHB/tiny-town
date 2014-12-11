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