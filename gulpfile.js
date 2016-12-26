var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var svgmin = require('gulp-svgmin');

var mode = 'debug';

var paths = {
	src: {
		js: './src/**/*.js',
		sass: './src/**/*.scss',
		svg: './src/**/*.svg'
	},

	debug: {
		dest: './debug'
	},

	release: {
		dest: './dist'
	}
};

gulp.task('lint', function(){
	gulp.src(paths.src.js)
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('basesass', function(){
	gulp.src(paths.src.sass)
	    .pipe(sass())
		.pipe(gulp.dest(paths.debug.dest))
	    .pipe(cleancss())
	    .pipe(gulp.dest(paths.release.dest));
});

gulp.task('scripts', function(){
	gulp.src(paths.src.js)
		.pipe(gulp.dest(paths.debug.dest))
	    .pipe(rename('jtree.min.js'))
	    .pipe(uglify())
	    .pipe(gulp.dest(paths.release.dest));
});

gulp.task('icon', function(){
	gulp.src(paths.src.svg)
		.pipe(gulp.dest(paths.debug.dest))
		.pipe(svgmin())
		.pipe(gulp.dest(paths.release.dest));
});

gulp.task('default', function(){
	gulp.run('lint', 'basesass', 'scripts', 'icon');
	gulp.watch(['./src/**/*.js', './src/**/*.scss', './src/**/*.svg'], function(){
		gulp.run('lint', 'basesass', 'scripts', 'icon');
	});
});
