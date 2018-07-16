﻿//gulp
var
	fs = require('fs'),
	gulp = require('gulp'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	header = require("gulp-header"),
	gzip = require('gulp-gzip'),
	clean = require('gulp-clean'),
	dateFormat = require('dateformat'),
	pkgInfo = require(pkgFile = './package'),
	sass = require('gulp-sass'),
	consolidate = require('gulp-consolidate'),
	iconfont = require('gulp-iconfont'),
	svgSprite = require('gulp-svg-sprite'),
	svg_to_png = require('svg-to-png')
// convertFile = require('convert-svg-to-png')
;


//gulp common config options
var gulpCfg = {
	srcRoot: "../../src/",
	scssDestRoot: "../../src/scss/",
	distRoot: "../../dist/",
	distFileDestination: "../../dist/css/"
};

// очистить консоль
console.log('\x1Bc');

// очистить каталог с файлами production
gulp.task('clean', () => {
	return gulp.src(`${gulpCfg.distFileDestination}*`)
		.pipe(clean({
			force: true
		}));
});
// очистить каталог с иконками для production
gulp.task('clean-icons', () => {
	return gulp.src('../../dist/icons/*')
		.pipe(clean({
			force: true
		}));
});
// выполнить очистку
gulp.task('clean-all', gulp.series([
	'clean',
	'clean-icons'
]));
// запуск препроцессора SASS
gulp.task('sass', () => {
	return gulp.src(`${gulpCfg.scssDestRoot}*.scss`)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(`${gulpCfg.scssDestRoot}`));
});
// переместить сгенерированные файлы css в каталог для production
gulp.task('css-all', () => {
	return gulp.src("../../src/scss/*.css")
		.pipe(gulp.dest(`../../dist/css`));
});

gulp.task('css-all-min', () => {
	return gulp.src("../../src/scss/*.css")
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: ".min",
			extname: ".css"
		}))
		.pipe(gulp.dest(`../../dist/css/min`));
});

gulp.task('css-icons-min', () => {
	return gulp.src("../../dist/icons/css/matrioshkaIcons.css")
		.pipe(cleanCSS({
			allowEmpty: true
		}))
		.pipe(rename("matrioshkaIcons.min.css"))
		.pipe(gulp.dest('../../dist/icons/css/'));
});

gulp.task('css-all-tarball', () => {
	gzip({
		append: true,
		gzipOptions: {
			level: 9
		}
	});

	return gulp.src("../../dist/css/min/*.css")
		.pipe(gzip())
		.pipe(gulp.dest(`../../dist/css/tar/`));
});

gulp.task('iconfont', function () {
	return gulp.src('../../src/icons/svg/*.svg')
		.pipe(iconfont({
			fontName: 'matrioshkaIcons',
			formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
			appendCodepoints: true,
			appendUnicode: false,
			normalize: true,
			fontHeight: 1001,
			centerHorizontally: true
		}))
		.on('glyphs', function (glyphs, options) {
			gulp.src('../../tools/icons/matrioshkaIcons.css')
				.pipe(consolidate('underscore', {
					glyphs: glyphs,
					fontName: options.fontName,
					fontDate: new Date().getTime()
				}))
				.pipe(gulp.dest('../../dist/icons/css/'));

			gulp.src('../../tools/icons/matrioshkaIcons.html')
				.pipe(consolidate('underscore', {
					glyphs: glyphs,
					fontName: options.fontName
				}))
				.pipe(gulp.dest('../../dist/icons/'));
		})
		.pipe(gulp.dest('../../dist/icons/fonts/'));
});

gulp.task('make-icons', gulp.series([
	'clean-icons',
	'iconfont',
	'css-icons-min'
]));

gulp.task('make-icon-sprite', function () {
	// More complex configuration example
	config = {
		shape: {
			dimension: { // Set maximum dimensions
				maxWidth: 64,
				maxHeight: 64
			},
			spacing: { // Add padding
				padding: 20
			},
		},
		mode: {
			view: { // Activate the «view» mode
				bust: false,
				render: {
					scss: false // Activate Sass output (with default options)
				}
			},
			symbol: false // Activate the «symbol» mode
		}
	};

	return gulp.src('**/*.svg', {
			cwd: '../../src/icons/svg'
		})
		.pipe(svgSprite(config))
		.pipe(gulp.dest('../../dist/icons/sprite/'));
});

gulp.task('svgtopng', () => {
	fs.readdir(`${gulpCfg.srcRoot}icons/svg`, (err, data) => {
		if (err) throw err;
		data.forEach(d => {
			console.log(d);

			// console.log(d);
			var inputFilePath = `${gulpCfg.srcRoot}icons/svg/${d}`;
			var outputFilePath = `${gulpCfg.distRoot}icons/i/png/${d.replace('.svg','')}.png`;
			svg_to_png.convert(inputFilePath, outputFilePath) // async, returns promise
			 	.then(function (a) {
					console.log(a)
			 	});


		});
	});
});

gulp.task('default', gulp.series([
	'clean-all',
	'sass',
	'css-all',
	'css-all-min',
	'css-all-tarball',
	'make-icons',
	'make-icon-sprite'
]));
