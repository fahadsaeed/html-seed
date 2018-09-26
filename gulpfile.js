// https://css-tricks.com/gulp-for-beginners/

var gulp = require('gulp');

// Requires the gulp-sass plugin
var sass = require('gulp-sass');

// Live-reloading with Browser Sync
var browserSync = require('browser-sync').create();

/*
These scripts are located in two different directories. It'll be difficult to concatenate them with traditional plugins
 like gulp-concatenate. Thankfully, there's a useful Gulp plugin, gulp-useref that solves this problem.

    <!-- build:<type> <path> -->
    ... HTML Markup, list of script / link tags.
    <!-- endbuild -->

    <!--build:js js/main.min.js -->
    <script src="js/lib/a-library.js"></script>
    <script src="js/lib/another-library.js"></script>
    <script src="js/app.js"></script>
    <!-- endbuild -->
*/

var useref = require('gulp-useref');

// We'll have to use the gulp-uglify plugin to help with minifying JavaScript files.
// We also need a second plugin called gulp-if to ensure that we only attempt to minify JavaScript files.
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');


// Cleaning up generated files automatically
// We'll have to use del to help us with cleaning.
var del = require('del');

// Combining Gulp tasks
var runSequence = require('run-sequence');

// html minify
var htmlmin = require('gulp-htmlmin');

// CSS minify
var cssnano = require('gulp-cssnano');

// add auto pre_fixer in css
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

// Convert ES6 to ES5 js
var babel = require('gulp-babel');

gulp.task('sass', function(){
    return gulp.src('src/sass/*.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(postcss(
            [autoprefixer({browsers: ['last 10 version']})]
        ))   // add auto prefixer in css
        .pipe(gulp.dest('src/client/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});


gulp.task('serve', ['browserSync', 'sass'], function (){
    // Reloads the browser whenever CSS, HTML or JS files change
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});


gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'src'
        }
    })
});


gulp.task('useref', function(){
    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'))
});


gulp.task('assets', function() {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('dist/assets'))
});


gulp.task('clean:dist', function() {
    return del.sync('dist');
});


gulp.task('build', function () {
    runSequence('clean:dist', ['sass', 'assets'], ['useref'],
        function (cb) {
            gulp.start('build:minify');
        }
    )
});


gulp.task('build:minify', function () {
    runSequence(['html:minify', 'css:minify', 'es6:js:minify'],
        function (cb) {
            console.log('Build success completed!');
        }
    )
});

// Gulp task to minify HTML files
gulp.task('html:minify', function() {
    return gulp.src(['dist/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('dist'));
});

// Gulp task to minify HTML files
gulp.task('css:minify', function() {
    return gulp.src(['dist/css/*.css'])
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist/css'));
});

// Gulp task to minify convert es6 to es5 files
gulp.task('es6:js:minify', () =>
    gulp.src('dist/js/app.min.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulp.dest('dist/js'))
);


gulp.task('default', function() {
    gulp.start('serve');
});

