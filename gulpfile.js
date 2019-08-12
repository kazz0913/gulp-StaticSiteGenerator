const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const ejs = require('gulp-ejs');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed')
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();

const webpackConfig = require('./webpack.config');

const imageminOptions = [
  pngquant(
    {
      quality: [0.65, 0.8],
      speed: 1
    }
  ),
  mozjpeg({
    quality: 60
  }),
  imagemin.gifsicle(),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo()
]

const browserSyncOption = {
  server: './dist'
}

gulp.task('scss', () => {
  return gulp.src('./src/scss/*.scss')
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('ejs', () => {
  return gulp.src(
      ['./src/html/*.ejs', '!./src/html/_*.ejs']
    )
    .pipe(ejs({ msg: 'Hello Gulp!' }, {}, { ext: '.html' }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('imagemin', () => {
  return gulp.src('./src/img/**/*.{jpg,png,gif,svg}')
  .pipe(changed('./dist/assets/img'))
  .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest('./dist/assets/img'))
})

gulp.task('bundle', () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('serve', (done) => {
  browserSync.init(browserSyncOption);
  done();
})

gulp.task('reload', (done) => {
  browserSync.reload();
  done();
})

gulp.task('watch', () => {
  gulp.watch('./src/html/**/*.ejs', gulp.task('ejs'))
  gulp.watch('./src/scss/**/*.scss', gulp.task('scss'))
  gulp.watch('./src/**/*.js', gulp.task('bundle'))
  gulp.watch('./dist/**/*', gulp.task('reload'))
})

gulp.task('dev', gulp.series('ejs', 'scss', 'bundle', 'serve', 'watch'))

gulp.task('default',
  gulp.series(
    gulp.parallel('ejs', 'scss', 'bundle'),
    (done) => {
      done();
    }
  )
)
