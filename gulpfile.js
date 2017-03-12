var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('clean', function(){
  return gulp.src('./dist')
    .pipe(clean());
});

gulp.task('default', ['clean'], function(){
  gulp.src('sinput.js').pipe(gulp.dest('./dist/'));
  return gulp.src('sinput.js')
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(concat('sinput.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['clean'], function(){
  gulp.src(['sinput.js', 'config.js'])
    .pipe(concat('sinput.js'))
    .pipe(gulp.dest('./dist/'));
  return gulp.src(['sinput.js', 'config.js'])
    .pipe(concat('sinput.min.js'))
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(gulp.dest('./dist/'));
});
