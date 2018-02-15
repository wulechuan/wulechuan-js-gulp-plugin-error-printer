const pathTool = require('path');

const { join: joinPath } = pathTool;

const gulp = require('gulp');
const pump = require('pump');

const compileStylus = require('gulp-stylus');
const uglifyJavascript = require('gulp-uglify');

const printGulpErrorBeautifully = require('./source/gulp-plugin-error-printer');



const sourceFileBasePath = './examples';
const basePathToShortenPrintedFilePaths = sourceFileBasePath;

gulp.task('build: css: stylus', () => {
	return gulp.src(joinPath(sourceFileBasePath, 'css-stylus/source.styl'))
		.pipe(compileStylus())
		.on('error', theError => {
			printGulpErrorBeautifully(theError, basePathToShortenPrintedFilePaths);
		});
});

gulp.task('build: css: stylus (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(joinPath(sourceFileBasePath, 'css-stylus/source.styl')));
	taskSteps.push(compileStylus());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpErrorBeautifully(theError, basePathToShortenPrintedFilePaths);
		}

		thisTaskIsDone();
	});
});

gulp.task('build: js: uglify', () => {
	return gulp.src(joinPath(sourceFileBasePath, 'js-uglify/wulechuan.js'))
		.pipe(uglifyJavascript())
		.on('error', theError => {
			printGulpErrorBeautifully(theError, basePathToShortenPrintedFilePaths);
		});
});

gulp.task('build: js: uglify (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(joinPath(sourceFileBasePath, 'js-uglify/wulechuan.js')));
	taskSteps.push(uglifyJavascript());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpErrorBeautifully(theError, basePathToShortenPrintedFilePaths);
		}

		thisTaskIsDone();
	});
});

gulp.task('default', [
	// 'build: css: stylus',
	'build: css: stylus (2)',
	// 'build: js: uglify',
	'build: js: uglify (2)',
]);