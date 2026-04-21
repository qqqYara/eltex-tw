/* --------------------------------------------------------------------------
 * >>> GULP Build :
 *  author: Yaroslav Mitiuk
 *  version: 1.1.0
 *  url: '#',
 *  linkedInUrl: 'https://www.linkedin.com/in/yaroslav-mitiuk/'
 * -------------------------------------------------------------------------- */

/* Source
 * ========================================================================= */

'use strict';

const projectFolder = 'dist';
const sourceFolder = '#src';

const { src, dest, series, parallel, watch } = require('gulp');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const scss = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');

let autoprefixer;
async function loadAutoprefixer() {
    if (!autoprefixer) {
        const mod = await import('gulp-autoprefixer');
        autoprefixer = mod.default || mod;
    }
    return autoprefixer;
}

let postcssNesting;
async function loadPostcssNesting() {
    if (!postcssNesting) {
        const mod = await import('postcss-nesting');
        postcssNesting = mod.default || mod;
    }
    return postcssNesting;
}


/* Define paths & directories
 * ========================================================================= */

const vendorLibraries = [
    // 'node_modules/jquery/dist/jquery.min.js',
    'node_modules/swiper/swiper-bundle.min.js'
];
const vendorStyles = [
    'node_modules/swiper/swiper-bundle.css'
];
const localLibraries = `${sourceFolder}/script/libraries/**/*.js`;
const localStyles = `${sourceFolder}/style/libraries/**/*.css`;

const paths = {
    build: {
        html: `${projectFolder}/`,
        css: `${projectFolder}/style/`,
        js: `${projectFolder}/scripts/`,
        img: `${projectFolder}/assets/images/`,
        fonts: `${projectFolder}/assets/fonts/`
    },
    src: {
        html: `${sourceFolder}/html/**/*.html`,
        css: `${sourceFolder}/style/style.{scss,sass}`,
        js: [
            `${sourceFolder}/script/**/*.js`,
            `!${sourceFolder}/script/libraries/**/*.js`
        ],
        libs: [...vendorLibraries, localLibraries],
        cssLibs: [...vendorStyles, localStyles],
        img: `${sourceFolder}/assets/images/**/*.{jpg,png,svg,gif,ico,webp}`,
        fonts: `${sourceFolder}/assets/fonts/**/*.*`
    },
    watch: {
        html: `${sourceFolder}/html/**/*.html`,
        css: `${sourceFolder}/style/**/*.{scss,sass}`,
        js: [
            `${sourceFolder}/script/**/*.js`,
            `!${sourceFolder}/script/libraries/**/*.js`
        ],
        libs: [...vendorLibraries, localLibraries],
        cssLibs: [...vendorStyles, localStyles],
        img: `${sourceFolder}/assets/images/**/*.{jpg,png,svg,gif,ico,webp}`,
        fonts: `${sourceFolder}/assets/fonts/**/*.*`
    },
    clean: projectFolder,
};

/* HTML Task
 * ========================================================================= */

function html() {
    return src(paths.src.html, { allowEmpty: true })
        .pipe(plumber())
        .pipe(dest(paths.build.html))
        .pipe(browserSync.stream());
}

/* Styles Task
 * ========================================================================= */

async function css() {
    const autoprefixerPlugin = await loadAutoprefixer();

    return src(paths.src.css, { allowEmpty: true })
        .pipe(plumber())
        .pipe(scss({ outputStyle: 'expanded' }).on('error', scss.logError))
        .pipe(
            autoprefixerPlugin({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true,
            })
        )
        .pipe(dest(paths.build.css))
        .pipe(cleanCSS({ level: 2, inline: ['none'] }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.build.css))
        .pipe(browserSync.stream());
}

/* JavaScript Task
 * ========================================================================= */

function scripts() {
    return src(paths.src.js, { allowEmpty: true })
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.build.js))
        .pipe(browserSync.stream());
}

/* Libraries Task
 * ========================================================================= */

function scriptsLibraries() {
    return src(paths.src.libs, { allowEmpty: true })
        .pipe(plumber())
        .pipe(concat('libraries.min.js'))
        .pipe(dest(paths.build.js))
        .pipe(browserSync.stream());
}

async function stylesLibraries() {
    const postcssNestingPlugin = await loadPostcssNesting();

    return src(paths.src.cssLibs, { allowEmpty: true })
        .pipe(plumber())
        .pipe(postcss([postcssNestingPlugin()]))
        .pipe(concat('libraries.min.css'))
        .pipe(cleanCSS({ level: 2, inline: ['none'] }))
        .pipe(dest(paths.build.css))
        .pipe(browserSync.stream());
}

/* Images Task
 * ========================================================================= */

function images() {
    return src(paths.src.img, { allowEmpty: true, encoding: false })
        .pipe(plumber())
        .pipe(dest(paths.build.img))
        .pipe(browserSync.stream());
}

/* Fonts Task
 * ========================================================================= */

function fonts() {
    return src(paths.src.fonts, { allowEmpty: true, encoding: false })
        .pipe(plumber())
        .pipe(dest(paths.build.fonts))
        .pipe(browserSync.stream());
}

/* Services Tasks
 * ========================================================================= */

function livereload(done) {
    browserSync.init({
        server: {
            baseDir: paths.build.html,
        },
        port: 8080,
        notify: false,
    });
    done();
}

function watchFiles() {
    watch(paths.watch.html, html);
    watch(paths.watch.css, css);
    watch(paths.watch.js, scripts);
    watch(paths.watch.libs, scriptsLibraries);
    watch(paths.watch.cssLibs, stylesLibraries);
    watch(paths.watch.img, images);
    watch(paths.watch.fonts, fonts);
}

async function clean() {
    const { deleteAsync } = await import('del');
    return deleteAsync(paths.clean);
}


/* GULP RUN
 * ========================================================================= */

// Register tasks to expose to the CLI
// ------------------------------------------------------------------------- */

const build = series(
    clean,
    parallel(html, css, scripts, images, fonts, scriptsLibraries, stylesLibraries)
);
const dev = parallel(build, watchFiles, livereload);

/* -------------------------------------------------------------------------
 * Define default task that can be called by just running `gulp` from cli
 * -------------------------------------------------------------------------
 */ 

exports.fonts = fonts;
exports.images = images;
exports.js = scripts;
exports.scripts = scripts;
exports.css = css;
exports.cssLibraries = stylesLibraries;
exports.html = html;
exports.livereload = livereload;
exports.libraries = scriptsLibraries;
exports.clean = clean;
exports.build = build;
exports.watch = dev;
exports.default = dev;