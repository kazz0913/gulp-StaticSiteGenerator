const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const packageImporter = require('node-sass-package-importer');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const autoprefixer = require('autoprefixer');
const cssDeclarationSoter = require('css-declaration-sorter');
const ejs = require('gulp-ejs');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed')
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();

const webpackConfig = require('./webpack.config');

const paths = {
  src: {
    scss: './src/scss/',
    js: './src/js/',
    img: './src/img/'
  },
  dist: {
    css: './dist/assets/css/',
    js: './dist/assets/js/',
    img: './dist/assets/img/'
  }
}

const sassOptions = {
  importer: packageImporter({
    extensions: ['scss', 'css']
  }),
  outputStyle: 'expanded',
}


const postCssOptions = [
  autoprefixer({
    grid: 'autoplace'
  }),
  mqpacker({
    sort: sortCSSmq
  }),
  cssDeclarationSoter({
    order: 'alphabetically' // 'alphabetically' or 'smacss' or 'concentric-css'
  })
  // cssnano({ autoprefixer: false })
]

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
  return gulp.src(paths.src.scss + 'style.scss')
    .pipe(sassGlob())
    .pipe(sass(sassOptions))
    .pipe(postcss(postCssOptions))
    .pipe(gulp.dest('./dist/assets/css'))
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
