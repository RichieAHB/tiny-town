var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss = require('gulp-minify-css');

function displayError(error) {
	var errorString = '[' + error.plugin + ']';
	errorString += ' ' + error.message.replace("\n",'');
	if(error.fileName) {
		errorString += ' in ' + error.fileName;
	}
	if(error.lineNumber) {
		errorString += ' on line ' + error.lineNumber;
	}
	console.error(errorString);
}

gulp.task('compile-css', function(){
	gulp.src('./scss/*.scss')
	.pipe(sass())
	.on('error', displayError)
	.pipe(autoprefixer())
	.pipe(minifyCss({
		keepBreaks: true,
		keepSpecialComments: 1,
		noAdvanced: 1
	}))
	.pipe(gulp.dest('./css/'));
});

gulp.task('default', ['compile-css'], function() {
	gulp.watch('./scss/**/*.scss', ['compile-css'])
	.on('change', function(evt) {
		console.log(
		'[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
		);
	});
});