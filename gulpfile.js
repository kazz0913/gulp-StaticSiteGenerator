const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const packageImporter = require('node-sass-package-importer');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const cleanCss = require('gulp-clean-css');
const cssDeclarationSorter = require('css-declaration-sorter');
const ejs = require('gulp-ejs');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackDevConfig = require('./config/webpack.dev');
const webpackProdConfig = require('./config/webpack.prod');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();

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

const postCssOptions = [
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
    .pipe(postcss(postCssOptions))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream())
})

gulp.task('cssmin', () => {
  return gulp.src([`${paths.dist.css}**/*.css`, `!${paths.dist.css}**/*.min.css`])
  .pipe(cleanCss())
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
  return gulp.src('./src/img/**/*.{jpg,png,gif,svg}')
  .pipe(changed('./dist/assets/img'))
  .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest('./dist/assets/img'))
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
})

gulp.task('dev', gulp.series('serve', 'watch'))

gulp.task('default',
  gulp.series(
    gulp.parallel('ejs', 'scss', 'bundle'),
    (done) => {
      done();
    }
  )
)
