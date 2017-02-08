var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('clean', function(){
  return gulp.src('./dist')
    .pipe(clean());
});

var preserveFirstComment = function() {
  var set = false;

  return function() {
     if (set) return false;
     set = true;
     return true;
  };
};

gulp.task('default', ['clean'], function() {
  gulp.src('sinput.js').pipe(gulp.dest('./dist/'));
  return gulp.src('sinput.js')
    .pipe(uglify({preserveComments: preserveFirstComment()}))
    .pipe(rename('sinput.min.js'))
    .pipe(gulp.dest('./dist/'));
});
