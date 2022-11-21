import gulp from 'gulp';
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import dartSass from 'sass';
import gulpSass from 'gulp-sass'
import sassGlob from 'gulp-sass-glob';
import packageImporter from 'node-sass-package-importer'
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import sortCSSmq from 'sort-css-media-queries';
import cleanCSS from 'gulp-clean-css'
import cssDeclarationSorter from 'css-declaration-sorter';
import ejs from 'gulp-ejs'
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackDevConfig from './config/webpack.dev.js';
import webpackProdConfig from './config/webpack.prod.js';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import { create as bsCreate } from 'browser-sync';
const browserSync = bsCreate()
const sass = gulpSass(dartSass)

const paths = {
  src: {
    html: './src/html/',
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
  outputStyle: 'expanded'
}

const postCSSOptions = [
  autoprefixer({
    grid: 'autoplace'
  }),
  mqpacker({
    sort: sortCSSmq
  }),
  cssDeclarationSorter({
    order: 'alphabetically' // 'alphabetically' or 'smacss' or 'concentric-css'
  })
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
  gifsicle(),
  optipng(),
  svgo()
]

const browserSyncOption = {
  server: './dist',
  notify: false
}

function template() {
  return gulp.src(
    [`${paths.src.html}**/*.ejs`, `!${paths.src.html}**/_*.ejs`])
  .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
  .pipe(ejs({}))
  .pipe(rename({ extname: '.html' }))
  .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, '$1'))
  .pipe(gulp.dest('./dist'));
}

function scss() {
  return gulp.src(paths.src.scss + 'style.scss')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass(sassOptions))
    .pipe(postcss(postCSSOptions))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
}

function cssmin() {
  return gulp.src([`${paths.dist.css}**/*.css`, `!${paths.dist.css}**/*.min.css`])
  .pipe(cleanCSS())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest(paths.dist.css));;
}

function jsBundle() {
  const webpackConfig = process.env.NODE_ENV === 'development' ? webpackDevConfig : webpackProdConfig;
  return plumber({ errorHandler: notify.onError('<%= error.message %>') })
  .pipe(webpackStream(webpackConfig, webpack))
  .pipe(gulp.dest(paths.dist.js));
}

function imageMinify() {
  return gulp.src(`${paths.src.img}**/*.{jpg,png,gif,svg}`)
  .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
  .pipe(changed(paths.dist.img))
  .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest(paths.dist.img));
}

function serve(done) {
  browserSync.init(browserSyncOption);
  done();
}

function liveReload(done) {
  browserSync.reload();
  done();
}

function watcher() {
  gulp.watch(`${paths.src.html}**/*.ejs`, gulp.series(template, liveReload))
  gulp.watch(`${paths.src.scss}**/*.scss`, scss)
  gulp.watch(`${paths.src.js}**/*.js`, gulp.series(jsBundle, liveReload))
  gulp.watch(`${paths.src.img}**`, imageMinify)
}

export const dev = gulp.series(serve, watcher)

export const build = gulp.parallel(
  template,
  gulp.series(scss, cssmin),
  jsBundle,
  imageMinify
)
