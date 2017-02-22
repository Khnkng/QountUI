var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    traceur = require('gulp-traceur'),
    webserver = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    ts = require('gulp-typescript'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpTypings = require("gulp-typings"),
    processhtml = require('gulp-processhtml'),
    del = require('del'),
    sass = require('gulp-sass'),
    path = require('path'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify'),
    cssnano = require('gulp-cssnano'),
    wiredep = require('wiredep').stream,
    bower = require('gulp-bower'),
    gulpif = require('gulp-if'),
    autoprefix = require('gulp-autoprefixer'),
    merge = require('merge-stream'),
    gzip = require('gulp-gzip'),
    umd = require("gulp-umd");


var processhtml_options = {
  list: "build/replacementlist.txt"
};

var ranBower = false;
var ranWiredep = false;

gulp.task('clean', function () {
  return del(['build/**']);
});

gulp.task('wiredep', ['bower'], function () {
  return gulp.src("./index.html").pipe(gulpif(!ranWiredep, wiredep({
    fileTypes: {
      html: {
        replace: {
          js: '<script src="/{{filePath}}"></script>'
        }
      }
    }
  }))).pipe(gulp.dest('./'));
});

gulp.task('bower', function () {
  return gulp.src("app").pipe(gulpif(!ranBower, bower()));
});

// run build tasks
//gulp.task('build', ['copy-to-build', 'typescript-compile', 'sass']);

gulp.task('build', function (callback) {
  runSequence('copy-to-build', 'typescript-compile', 'sass', 'copy-misc',
      callback);
});


// run development task
gulp.task('dev', ['watch']);

// run production task
gulp.task('prod', function () {
  runSequence('clean', 'prod-typescript-compile', 'bundle');
});

// serve the build dir
gulp.task('serve', ['build'], function () {
  ranBower = true;
  ranWiredep = true;
  return gulp.src('build')
      .pipe(webserver({
        open: true,
        port: 8000,
        fallback: 'index.html'
      }));
});

gulp.task('typescript-compile', function () {
    var tsProject = ts.createProject('tsconfig.json');
    var qCommonProject = ts.createProject('node_modules/qCommon/tsconfig.json');
    var reportsProject = ts.createProject('node_modules/reportsUI/tsconfig.json');
    var billsProject = ts.createProject('node_modules/billsUI/tsconfig.json');
    var invoiceProject = ts.createProject('node_modules/invoicesUI/tsconfig.json');

    var tsResult = tsProject.src() // instead of gulp.src(...)
      .pipe(tsProject());
    var qCommonProjectResult = qCommonProject.src() // instead of gulp.src(...)
      .pipe(qCommonProject());
    var reportsProjectResult = reportsProject.src() // instead of gulp.src(...)
        .pipe(reportsProject());
    var billsProjectResult = billsProject.src() // instead of gulp.src(...)
      .pipe(billsProject());
    var invoiceProjectResult = invoiceProject.src()
        .pipe(invoiceProject());
    return merge(tsResult.js.pipe(gulp.dest('build/app/')), qCommonProjectResult.js.pipe(gulp.dest('build/lib/qCommon')),
        reportsProjectResult.js.pipe(gulp.dest('build/lib/reportsUI')),billsProjectResult.js.pipe(gulp.dest('build/lib/billsUI')),
        invoiceProjectResult.js.pipe(gulp.dest('build/lib/invoicesUI'))).pipe(livereload());
});

gulp.task('prod-typescript-compile', function () {
    var tsProject = ts.createProject('tsconfig.json');
    var qCommonProject = ts.createProject('node_modules/qCommon/tsconfig.json');
    var reportsProject = ts.createProject('node_modules/reportsUI/tsconfig.json');
    var billsProject = ts.createProject('node_modules/billsUI/tsconfig.json');
    var invoiceProject = ts.createProject('node_modules/invoicesUI/tsconfig.json');

    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(tsProject());
    var qCommonProjectResult = qCommonProject.src() // instead of gulp.src(...)
        .pipe(qCommonProject());
    var reportsProjectResult = reportsProject.src() // instead of gulp.src(...)
        .pipe(reportsProject());
    var billsProjectResult = billsProject.src() // instead of gulp.src(...)
        .pipe(billsProject());
    var invoiceProjectResult = invoiceProject.src()
        .pipe(invoiceProject());
    return merge(tsResult.js.pipe(gulp.dest('build/app/')), qCommonProjectResult.js.pipe(gulp.dest('build/lib/qCommon')),
        reportsProjectResult.js.pipe(gulp.dest('build/lib/reportsUI')),billsProjectResult.js.pipe(gulp.dest('build/lib/billsUI')),
        invoiceProjectResult.js.pipe(gulp.dest('build/lib/invoicesUI'))).pipe(livereload());
});

// watch for changes and run the relevant task
gulp.task('watch', ['serve'], function () {
  livereload.listen();
  gulp.watch('app/assets/*.js', ['js']);
  gulp.watch('app/**/*.ts', ['typescript-compile']);
  gulp.watch('node_modules/reportsUI/app/**/*.*', ['typescript-compile']);
  gulp.watch('node_modules/billsUI/app/**/*.*', ['typescript-compile']);
  gulp.watch('node_modules/invoicesUI/app/**/*.*', ['typescript-compile']);
  gulp.watch('node_modules/qCommon/app/**/*.*', ['typescript-compile']);
  gulp.watch(['./index.html', './app/views/*.html'], ['html']);
  gulp.watch('app/**/*.css', ['css']);
  gulp.watch('images/**/*.*', ['images']);
  gulp.watch('css/**/*.scss', ['sass']);
});

gulp.task('generate-umd', ['typescript-compile'], function(){
  return gulp.src('node_modules/qCommon/**/*.js')
      .pipe(umd())
      .pipe(gulp.dest('node_modules/qCommon/bundles'));
});

gulp.task('copy-to-build', ['dependencies', 'js', 'html', 'fonts', 'images']);

// move dependencies into build dir
gulp.task('dependencies', function () {
  var libs = gulp.src([
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/socket.io-client/dist/socket.io.js',
    'app/assets/**/*.js',
    'app/bower_components/footable/compiled/footable.min.js',
    'app/bower_components/tag-it/js/tag-it.js'
  ]).pipe(gulp.dest('build/lib'));

  var angular = gulp.src(['node_modules/@angular/**/*.*']).pipe(gulp.dest('build/lib/@angular'));
  var angularInMemory = gulp.src(['node_modules/angular2-in-memory-web-api/**/*.*']).pipe(gulp.dest('build/lib/angular2-in-memory-web-api'));
  var rxjs = gulp.src(['node_modules/rxjs/**/*.*']).pipe(gulp.dest('build/lib/rxjs'));
  var angular2uuid = gulp.src(['node_modules/angular2-uuid/**/*.*']).pipe(gulp.dest('build/lib/angular2-uuid'));
  var ng2uploader = gulp.src(['node_modules/ng2-file-upload/**/*.*']).pipe(gulp.dest('build/lib/ng2-file-upload'));
  var immutable = gulp.src(['node_modules/immutable/**/*.*']).pipe(gulp.dest('build/lib/immutable'));
  return merge(libs, angular, angularInMemory, rxjs, angular2uuid, ng2uploader, immutable);
});

gulp.task('sass', function () {
  return gulp.src('css/sass/**/*.scss')
      .pipe(sass({
        errLogToConsole: true,
        outputStyle: 'expanded'
      }))
      .pipe(autoprefix({
        browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
      }))
      .pipe(gulp.dest('build/css')).pipe(livereload());
});

// move js
gulp.task('js', function () {
  return gulp.src(['app/**/*.js'])
      .pipe(gulp.dest('build/app/')).pipe(livereload());
});

// move html
gulp.task('html', ['wiredep'], function () {
  var html = gulp.src(['./index.html', './app/**/*.html'], {base: '.'})
      .pipe(gulp.dest('build/'));
  var reportsHtml = gulp.src(['./node_modules/reportsUI/app/views/*.html'])
        .pipe(gulp.dest('build/app/views/'));
  var paymentsHtml = gulp.src(['./node_modules/billsUI/app/views/*.html'])
      .pipe(gulp.dest('build/app/views/'));
  var invoicesHtml = gulp.src(['./node_modules/invoicesUI/app/views/*.html'])
        .pipe(gulp.dest('build/app/views/'));
  return merge(html, reportsHtml, paymentsHtml, invoicesHtml).pipe(livereload());
});

// move css
gulp.task('fonts', function () {
  return gulp.src(['fonts/*.*'])
      .pipe(gulp.dest('build/fonts')).pipe(livereload());
});

// move images
gulp.task('images', function () {
  return gulp.src(['images/**/*.*'])
      .pipe(gulp.dest('build/images')).pipe(livereload());
});


gulp.task('copy-misc', function () {
  return gulp.src(['*.ico', '*.js'])
      .pipe(gulp.dest('build/'));
});

gulp.task('copy-fonts-prod', function () {
  return gulp.src('fonts/**/*.*')
      .pipe(gulp.dest('build/prod/fonts/'));
});

gulp.task('copy-misc-prod', function () {
  return gulp.src(['*.ico'])
      .pipe(gulp.dest('build/prod'));
});

gulp.task('prod-images', function () {
  return gulp.src(['images/**/*.*'])
      .pipe(gulp.dest('build/prod/images/'));
});

gulp.task('process-html', ['dependencies'], function () {
  return gulp.src('index.html')
      .pipe(processhtml(processhtml_options))
      .pipe(gulp.dest('build/prod/'));
});

gulp.task('prod-html', ['process-html'], function () {
  var fileList = []
  try {
    fileList = require('fs').readFileSync('build/replacementlist.txt', 'utf8');
    console.log("list", fileList);
    del([
      'build/replacementlist.txt'
    ])
  } catch (e) {
    console.error(e);
    return;
  }

  var files = fileList.match(/:.+/ig).map(function (matched) {
    // for each matched item (ie each line)
    // replace the ':'' with 'dev/'
    var lindex = matched.lastIndexOf(":");
    return matched.substring(lindex + 1).replace("/lib", 'build/lib').replace("/app", 'app');
  });

  var result = gulp.src(files)
      .pipe(concat('qount.js'))
      .pipe(uglify())
      .pipe(gulp.dest('build/prod/js/'));

  return result;
});

gulp.task('prod-css', ['sass'], function () {
  return gulp.src('build/css/**/*.css')
      .pipe(concat('qount.css'))
      .pipe(gulp.dest('build/prod/css/'))
      .pipe(cssnano())
      .pipe(gulp.dest('build/prod/css/'));
});

gulp.task('copy-to-prod', ['prod-images', 'copy-misc-prod', 'copy-fonts-prod', 'prod-html', 'prod-css'], function () {
  var views = gulp.src(['app/**/*.html'])
      .pipe(gulp.dest('build/prod/app'));
  var reportsJs = gulp.src(['build/lib/reportsUI/**/*.js'])
      .pipe(gulp.dest('build/prod/lib/reportsUI/'));
  var reportsHtml = gulp.src(['./node_modules/reportsUI/app/views/*.html'])
      .pipe(gulp.dest('build/prod/app/views/'));
  var paymentsHtml = gulp.src(['./node_modules/billsUI/app/views/*.html'])
      .pipe(gulp.dest('build/prod/app/views/'));
  var invoicesHtml = gulp.src(['./node_modules/invoicesUI/app/views/*.html'])
      .pipe(gulp.dest('build/prod/app/views/'));
  return merge(views, reportsJs, reportsHtml, paymentsHtml, invoicesHtml);
});

gulp.task('gzipfiles', function(){
  return gulp.src(['build/prod/**/*.*', '!build/prod/fonts/*.*', '!build/prod/*.ico' , '!build/prod/images/*.*'])
      .pipe(gzip({
        append: false
      }))
      .pipe(gulp.dest('build/prod/'));
});

gulp.task('bundle', ['copy-to-prod'], function (cb) {
  var Builder = require('systemjs-builder');
  var builder = new Builder("/", "systemjs.prod.config.js");

  //builder.reset();

  builder.buildStatic("app", "./build/prod/js/app.min.js", {})
      .then(function (output) {
        cb();
      })
      .catch(function (err) {
        console.log(err);
        cb(err);
      });
});
