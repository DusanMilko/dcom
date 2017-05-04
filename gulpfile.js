var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var rename = require('gulp-rename');
var gutil = require('gutil');

// Check for --production flag
var isProduction = !!(argv.production);

// css
var cssGlobbing = require('gulp-css-globbing');
var cleanCSS    = require('gulp-clean-css');

// images
var imagemin = require('gulp-imagemin');
var imageminGuetzli = require('imagemin-guetzli');
var cache = require('gulp-cache');

// iconfont task1
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var lodash = require('lodash');

// js
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var uglify = require('gulp-uglify');

// static site
var assemble = require('assemble');
var app = assemble();

var paths = {
  src: 'src/',
  build: 'build/',
  images: 'src/assets/imgs/**/*'
};

var sassPaths = [
  'node_modules/foundation-sites/scss'
];


gulp.task('watch', ['iconfont','images','fonts','scss','js','assemble'], function() {
  gulp.watch(paths.src+'assets/scss/**/*.scss', ['scss']);
  gulp.watch(paths.src+'assets/js/**/*.js', ['js']);
  gulp.watch(paths.src+'assets/imgs/**/*.{jpg,png,gif}', ['images']);
  gulp.watch(paths.src+'views/**/*.hbs', ['assemble']);

  gulp.run('sync');
});

gulp.task('default', ['clean'], function() {
  gulp.run('watch');
});

gulp.task('build', ['clean'], function() {
  gulp.run('default');
});

gulp.task('clean', function(cb) {
  var del = require('del');

  return del([paths.build+'**/*'], cb);
});

gulp.task('sync', function() {
  var browserSync = require('browser-sync');
  var reload = browserSync.reload;

  browserSync({
    server: {
      baseDir: "./build"
    }
  });

  gulp.watch("build/**/*").on('change', reload);
});

// ----------------------------------------------------------------

// Generate Css from Scss
gulp.task('scss', function() {
  gulp.src(paths.src+'assets/scss/main.scss')
    .pipe($.sourcemaps.init())
    .pipe(cssGlobbing({
      extensions: ['.css', '.scss'],
      ignoreFolders: ['../styles'],
      autoReplaceBlock: {
        onOff: false,
        globBlockBegin: 'cssGlobbingBegin',
        globBlockEnd: 'cssGlobbingEnd',
        globBlockContents: '../**/*.scss'
      },
      scssImportPath: {
        leading_underscore: false,
        filename_extension: false
      }
    }))
    .pipe($.sass({
      includePaths: sassPaths
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe($.if(isProduction, cleanCSS()))
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe(gulp.dest(paths.build+'assets/css'));

  gulp.src(paths.src+'assets/scss/docs/docs.scss')
    .pipe($.sourcemaps.init())
    .pipe(cssGlobbing({
      extensions: ['.css', '.scss'],
      ignoreFolders: ['../styles'],
      autoReplaceBlock: {
        onOff: false,
        globBlockBegin: 'cssGlobbingBegin',
        globBlockEnd: 'cssGlobbingEnd',
        globBlockContents: '../**/*.scss'
      },
      scssImportPath: {
        leading_underscore: false,
        filename_extension: false
      }
    }))
    .pipe($.sass({
      includePaths: sassPaths
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe($.if(isProduction, cleanCSS()))
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe(gulp.dest(paths.build+'assets/css'));
});

// ----------------------------------------------------------------

// Copy all static images
gulp.task('images', function() {
  return gulp.src(paths.images)
    //.pipe(cache(imagemin({optimizationLevel: 7})))
    .pipe(imagemin(
      //{optimizationLevel: 7}
      [imageminGuetzli({
        quality: 70
      })]
    ))
    .pipe(gulp.dest(paths.build+'assets/imgs'));
});

// Copy all fonts
gulp.task('fonts', function() {
  return gulp.src(paths.src+'assets/fonts/**/*')
    .pipe(gulp.dest(paths.build+'assets/fonts'));
});

// ----------------------------------------------------------------

// Generate Icon font form svgs
gulp.task('iconfont', function(){
  gulp.src([paths.src+'assets/icons/svgs/*.svg'])
    .pipe(iconfont({
      fontName: 'custom-icon-font',
      formats: ['ttf', 'eot', 'woff', 'svg'],
      normalize: true,
      fontHeight: 400
    }))
    .on('glyphs', function(glyphs, options) {
      gulp.src(paths.src+'assets/icons/icon-font.scss')
        .pipe(consolidate('lodash', {
          glyphs: glyphs,
          fontName: 'custom-icon-font',
          fontPath: '../fonts/icons/',
          className: 'i'
        }))
        .pipe(gulp.dest(paths.src+'assets/scss/base'));
    })
    .pipe(gulp.dest(paths.src+'assets/fonts/icons'));
});

// ----------------------------------------------------------------

// Generate JS with browserify with sourcemaps
gulp.task('js', function() {
  var uglify = $.uglify()
    .on('error', $.notify.onError({
      message: "<%= error.message %>",
      title: "Uglify JS Error"
    }));

  var plugins = [];
  if(isProduction == true){
    plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      })
    ]
  }

  gulp.src(paths.src+'assets/js/libs/**/*')
    .pipe(gulp.dest(paths.build+'assets/js/libs'));
  gulp.src(paths.src+'assets/js/data/**/*')
    .pipe(gulp.dest(paths.build+'assets/js/data'));
  gulp.src(paths.src+'assets/js/main.js')
    .pipe($.sourcemaps.init())
    .pipe(
      gulpWebpack({
        watch: true,
        plugins: plugins,
        module: {
          loaders: [
            {
              enforce: 'pre',
              test: /\.js$/,
              exclude: [/node_modules/, /libs/],
              loader: 'eslint-loader'
            },
            {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: 'babel-loader',
              query: {
                presets: ['es2015']
              }
            },
          ],
        }
      }, webpack)
    )
    .on('error', function (err) {
      gutil.log('ERROR: '+err.message);
      this.emit('end');
    })
    .pipe($.if(isProduction, uglify))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(rename('main.js'))
    .pipe(gulp.dest(paths.build+'assets/js'))
});

// ----------------------------------------------------------------

// Assemble
app.data(paths.src+'data/**/*.{json,yml}');
app.helpers(paths.src+'helpers/**/*.js');
app.partials(paths.src+'views/partials/**/*.hbs');
app.layouts(paths.src+'views/layouts/**/*.hbs')

gulp.task('assemble', function() {
  app.data(paths.src+'data/**/*.{json,yml}');
  app.build(['views','docs'], function(err) {
    if (err) throw err;
  });
});

app.task('views', function() {
  app.helpers(paths.src+'helpers/**/*.js');
  app.partials(paths.src+'views/partials/**/*.hbs');
  app.layouts(paths.src+'views/layouts/**/*.hbs')
  app.pages(paths.src+'views/pages/**/*.hbs');

  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(app.dest(paths.build));
});

app.create('docs');
app.task('docs', function() {
  app.helpers(paths.src+'helpers/**/*.js');
  app.partials(paths.src+'views/partials/**/*.hbs');
  app.layouts(paths.src+'views/layouts/**/*.hbs')
  app.docs(paths.src+'views/docs/**/*.hbs');
  app.helper('markdown', require('helper-markdown'));

  return app.toStream('docs')
    .pipe(app.renderFile())
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(app.dest(paths.build+'docs/'));
});

module.exports = app;