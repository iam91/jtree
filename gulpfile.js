var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('lint', function(){
	gulp.src('./src/**/*.js')
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('sass', function(){
	gulp.src('./src/**/*.scss')
	    .pipe(sass())
	    .pipe(gulp.dest('./dist'))
	    .pipe(rename('jtree.min.css'))
	    .pipe(minifycss())
	    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function(){
	gulp.src('./src/**/*.js')
	    .pipe(rename('jtree.min.js'))
	    .pipe(uglify())
	    .pipe(gulp.dest('./dist'));
});

gulp.task('default', function(){
	gulp.run('lint', 'sass', 'scripts');
	gulp.watch(['./src/**/*.js', './src/**/*.scss'], function(){
		gulp.run('lint', 'sass', 'scripts');
	});
});
