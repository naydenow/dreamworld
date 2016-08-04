'use strict';

// Requirements
//------------------------------------------------------------------------
const gulp = require('gulp'),

    notify = require('gulp-notify'),
    browserify = require('browserify'),
    gutil = require('gulp-util'),
    vinylSource = require('vinyl-source-stream'),
    es2015fy = require('./../platform-assets/assets-es2015fy/source');


// ES2015
//------------------------------------------------------------------------
gulp.task('browserify', () => {
    return browserify('./source/app.js', {debug: true, insertGlobals: false})
        .transform(es2015fy)
        .bundle().on('error', function (err) {
            let args = Array.prototype.slice.call(arguments);
            gutil.log(gutil.colors.red('Browserify error:'), err.message);
            notify.onError('Browserify error: <%= error.message %>').apply(this, args);
            this.emit('end');
        })
        .pipe(vinylSource('app.js'))
        .pipe(gulp.dest('./build/'));
});

// Copy-images
//------------------------------------------------------------------------
gulp.task('copy-files', () => {
    return gulp.src('./source/client/**/*')
        .pipe(gulp.dest('./build'));
});

// copy-jade


// Default task
//------------------------------------------------------------------------
gulp.task('default', [
    'copy-files',
    'browserify'

]);
