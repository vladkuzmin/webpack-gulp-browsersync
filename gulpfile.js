const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const argv = require('yargs').boolean('production').argv;
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require("browser-sync").create();
const cssnano = require('gulp-cssnano');
const jshint = require('gulp-jshint');
const gcmq = require('gulp-group-css-media-queries');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;

// Webpack config file
//------------------------
let webpackConfig = require('./webpack.config.js');
let webpackConfigProd = require('./webpack.config.prod.js');
//-------------------------
const isProd = !!argv.production;
const isDev = !isProd;


gulp.task('default', function (callback) {
    runSequence('html', 'js', 'sass', 'images', 'watch', 'server', callback);
});

// Templates
//--------------------------
gulp.task('html', () => {
  gulp.src('./sources/templates/**/*.pug')
   .pipe(pug())
    .pipe(gulp.dest('./build/'));
});
//--------------------------

// Scripts
// -------------------------
let scriptFiles = [
  "./sources/js/Function.js",
  "./sources/js/App.js",
]

gulp.task('js', () => {
  gulp.src(scriptFiles)
    .pipe(gulpif(isDev, webpackStream((webpackConfig), webpack)))
    .pipe(gulpif(isProd, webpackStream((webpackConfigProd), webpack)))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});
//--------------------------


// SASS
//-------------------------
gulp.task("sass", () => {
  return gulp.src("./sources/sass/**/*.scss")
      .pipe(plumber(function (error) {
          gutil.log(gutil.colors.red(error.message));
          this.emit('end');
      }))
      .pipe(gulpif(isDev, sourcemaps.init()))
      .pipe(sass())
      .pipe(gulpif(isProd, autoprefixer({
          browsers: ["last 2 versions"]
      })))
      .pipe(gulpif(isProd, gcmq()))
      .pipe(gulpif(isProd, cssnano()))
      .pipe(gulpif(isDev, sourcemaps.write('./_sourcemaps')))
      .pipe(gulp.dest("./build/css/"));
});
//-------------------------


// Images
//-------------------------
gulp.task('images', () =>
    gulp.src('./sources/img/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('./build/img'))
);
//-------------------------

// Watch
//--------------------------
gulp.task('watch', () => {
	gulp.watch('./sources/templates/**/*', ['html']);
  gulp.watch('./sources/sass/**/*', ['sass']);
  gulp.watch('./sources/img/**/*', ['images']);
});
//--------------------------

// BrowserSync
//--------------------------
gulp.task('server', () => {
   browserSync.init({
        server: {
            baseDir: "build"
        },
        files: ["./build/css/*", "./build/js/*.js", "./build/*.html"] 
    });
});
//--------------------------



