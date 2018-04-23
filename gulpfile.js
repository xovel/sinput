var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');

gulp.task('clean', function () {
  return gulp.src('./dist')
    .pipe(clean());
});

gulp.task('default', ['clean'], function () {
  return gulp.src('src/sinput.js')
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(concat('sinput.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['clean'], function () {
  return gulp.src(['src/sinput.js', 'config.js'])
    .pipe(concat('sinput.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(concat('sinput.min.js'))
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('less', function () {
  return gulp.src(['src/sinput.less'])
    .pipe(less())
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch(['src/sinput.less'], ['less']);
});
