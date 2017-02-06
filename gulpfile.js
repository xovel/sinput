var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('clean', function(){
  return gulp.src('./dist')
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
  gulp.src('sinput.js').pipe(gulp.dest('./dist/'));
  return gulp.src('sinput.js')
    .pipe(uglify())
    .pipe(rename('sinput.min.js'))
    .pipe(gulp.dest('./dist/'));
});
