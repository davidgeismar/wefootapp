var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var bower = require('bower');
var concat = require('gulp-concat');
var replace = require('gulp-regex-replace');
// var sass = require('gulp-sass');
// var minifyCss = require('gulp-minify-css');
// var rename = require('gulp-rename');
// var sh = require('shelljs');
 
gulp.task('templates', function(){
  gulp.src(['file.txt'])
    .pipe(replace(/foo(.{3})/g, '$1foo'))
    .pipe(gulp.dest('build/file.txt'));
});

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

// gulp.task('product', function(){
//   return gulp.src('www/js/app.js')
//     .pipe(replace({regex:'62.210.115.66:9000',replace:'62.210.115.66:9000'}));
// })
// gulp.task('launch',function(){
//   return gulp.src(['www/js/global.js','www/js/declare.js','www/js/routes.js','www/js/provider.js'])
//       .pipe(concat('app.js'))
//       // .pipe(uglify())
//       .pipe(gulp.dest('www/js/'));
// });

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
