const pathTool = require('path');

const { join: joinPath } = pathTool;

const gulp = require('gulp');
const pump = require('pump');

const compileStylus = require('gulp-stylus');
const compileLESS = require('gulp-less');
const compileSass = require('gulp-sass');
const uglifyJavascript = require('gulp-uglify');


const printGulpPluginErrorBeautifully = require('.');

/*
*
*
*
*
*
*
* ****************************************
*               整理环境常量
*             Env. Constants
* ****************************************
*/

// --------------- 基本常量 (Basic) ---------------

const npmProjectRootPath = process.cwd();
const packageJSON = require(joinPath(npmProjectRootPath, 'package.json')); // eslint-disable-line import/no-dynamic-require

const {
	example: exampleSourceFileBasePath,
} = packageJSON.directories;


const errorPrintingConfigurations = {
	basePathToShortenPrintedFilePaths: exampleSourceFileBasePath,

	colorTheme: {
		heading: {
			lineColor: 'magenta',
		},
	},
};


// --------------- globs ---------------

const sourceGlobsCSSStylusEntries = [
	joinPath(exampleSourceFileBasePath, 'css-stylus/source.styl'),
];

const sourceGlobsCSSLESSEntries = [
	joinPath(exampleSourceFileBasePath, 'css-less/wulechuan.less'),
];

const sourceGlobsCSSSassEntries = [
	joinPath(exampleSourceFileBasePath, 'css-sass/wulechuan.scss'),
];

const sourceGlobsJavascriptBuildingEntries = [
	joinPath(exampleSourceFileBasePath, 'js-uglify/wulechuan.js'),
];

/*
*
*
*
*
*
*
* ****************************************
*                  任务集
*                  Tasks
* ****************************************
*/

// When utilizing the `on('error')` method of a gulp's vinyl-fs instance,
// the error will propagate outside the event handler.
// And will finally get printed the traditional way.
// Since this logger also prints the error, the error is printed **twice**.

gulp.task('build: css: stylus (1)', () => {
	return gulp.src(sourceGlobsCSSStylusEntries)
		.pipe(compileStylus())
		.on('error', theError => {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		});
});

gulp.task('build: js: uglify (1)', () => {
	return gulp.src(sourceGlobsJavascriptBuildingEntries)
		.pipe(uglifyJavascript())
		.on('error', theError => {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		});
});




gulp.task('build: css: stylus (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(sourceGlobsCSSStylusEntries));
	taskSteps.push(compileStylus());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		}

		thisTaskIsDone();
	});
});

gulp.task('build: css: LESS (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(sourceGlobsCSSLESSEntries));
	taskSteps.push(compileLESS());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		}

		thisTaskIsDone();
	});
});

gulp.task('build: css: sass (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(sourceGlobsCSSSassEntries));
	taskSteps.push(compileSass());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		}

		thisTaskIsDone();
	});
});

gulp.task('build: js: uglify (2)', (thisTaskIsDone) => {
	const taskSteps = [];

	taskSteps.push(gulp.src(sourceGlobsJavascriptBuildingEntries));
	taskSteps.push(uglifyJavascript());

	pump(taskSteps, (theError) => {
		if (theError) {
			printGulpPluginErrorBeautifully(theError, errorPrintingConfigurations);
		}

		thisTaskIsDone();
	});
});





// The default task
gulp.task('default', [
	// 'build: css: stylus (1)',
	'build: css: stylus (2)',
	'build: css: LESS (2)',
	'build: css: sass (2)',
	// 'build: js: uglify (1)',
	'build: js: uglify (2)',
]);