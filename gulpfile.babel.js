import gulp from 'gulp';
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import sass from 'gulp-sass'
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
import webpackDevConfig from './config/webpack.dev';
import webpackProdConfig from './config/webpack.prod';
import imagemin from 'gulp-imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import { create as bsCreate } from 'browser-sync';
const browserSync = bsCreate()

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
  imagemin.gifsicle(),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo()
]

const browserSyncOption = {
  server: './dist',
  notify: false,
}

gulp.task('ejs', () => {
  return gulp.src(
    [`${paths.src.html}**/*.ejs`, `!${paths.src.html}**/_*.ejs`])
  .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
  .pipe(ejs({}))
  .pipe(rename({ extname: '.html' }))
  .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, '$1'))
  .pipe(gulp.dest('./dist'))
})

gulp.task('scss', () => {
  return gulp.src(paths.src.scss + 'style.scss')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass(sassOptions))
    .pipe(postcss(postCSSOptions))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream())
})

gulp.task('cssmin', () => {
  return gulp.src([`${paths.dist.css}**/*.css`, `!${paths.dist.css}**/*.min.css`])
  .pipe(cleanCSS())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest(paths.dist.css))
})

gulp.task('bundle', () => {
  const webpackConfig = process.env.NODE_ENV === 'development' ? webpackDevConfig : webpackProdConfig;
  return plumber({ errorHandler: notify.onError('<%= error.message %>') })
  .pipe(webpackStream(webpackConfig, webpack))
  .pipe(gulp.dest(paths.dist.js))
})

gulp.task('imagemin', () => {
  return gulp.src(`${paths.src.img}**/*.{jpg,png,gif,svg}`)
  .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
  .pipe(changed(paths.dist.img))
  .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest(paths.dist.img))
})

gulp.task('serve', done => {
  browserSync.init(browserSyncOption);
  done();
})

gulp.task('ejs-watch', gulp.series('ejs', done => {
  browserSync.reload();
  done();
}))

gulp.task('js-watch', gulp.series('bundle', done => {
  browserSync.reload();
  done();
}))

gulp.task('watch', () => {
  gulp.watch(`${paths.src.html}**/*.ejs`, gulp.task('ejs-watch'))
  gulp.watch(`${paths.src.scss}**/*.scss`, gulp.series('scss', 'cssmin'))
  gulp.watch(`${paths.src.js}**/*.js`, gulp.task('js-watch'))
  gulp.watch(`${paths.src.img}**`, gulp.task('imagemin'))
})

gulp.task('dev', gulp.series('serve', 'watch'))

gulp.task(
  'build',
  gulp.parallel(
    gulp.series('scss', 'cssmin'),
    gulp.task('bundle'),
    gulp.task('imagemin')
  )
)
