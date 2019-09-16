const path = require('path');


const {
	src:      gulpRead,
	// dest:     gulpWrite,
	parallel: gulpParallel,
} = require('gulp');

const compileStylus = require('gulp-stylus');
const compileLESS = require('gulp-less');
// const compileSass = require('gulp-sass');
const uglifyJavascript = require('gulp-uglify');

const printGulpPluginErrorBeautifully = require('..');




const joinPathPOSIX = path.posix.join;

const exampleSourceFileBasePath = '.';




// --------------- config this tool ---------------

const errorOfGlupPluginsPrintingConfigurations = {
	basePathToShortenPrintedFilePaths: exampleSourceFileBasePath,

	colorTheme: {
		heading: {
			lineColor: 'magenta',
		},
	},
};





// --------------- source globs ---------------

const sourceGlobsOfCSSStylus = [
	joinPathPOSIX(exampleSourceFileBasePath, 'css-stylus/source.styl'),
];

const sourceGlobsOfCSSLESS = [
	joinPathPOSIX(exampleSourceFileBasePath, 'css-less/wulechuan.less'),
];

// const sourceGlobsOfCSSSass = [
// 	joinPathPOSIX(exampleSourceFileBasePath, 'css-sass/wulechuan.scss'),
// ];

const sourceGlobsOfJavascripts = [
	joinPathPOSIX(exampleSourceFileBasePath, 'js-uglify/wulechuan.js'),
];






// --------------- tasks ---------------

function buildCSSStylus (cb) {
	return gulpRead(sourceGlobsOfCSSStylus)
		.pipe(compileStylus())
		.on('error', theError => {
			printGulpPluginErrorBeautifully(theError, errorOfGlupPluginsPrintingConfigurations);
			cb();
		});
}

function buildCSSLESS (cb) {
	return gulpRead(sourceGlobsOfCSSLESS)
		.pipe(compileLESS())
		.on('error', theError => {
			printGulpPluginErrorBeautifully(theError, errorOfGlupPluginsPrintingConfigurations);
			cb();
		});
}

// function buildCSSSass (cb) {
// 	return gulpRead(sourceGlobsOfCSSLESS)
// 		.pipe(compileSass())
// 		.on('error', theError => {
// 			printGulpPluginErrorBeautifully(theError, errorOfGlupPluginsPrintingConfigurations);
//          cb();
// 		});
// }

function minifyJavascript (cb) {
	return gulpRead(sourceGlobsOfJavascripts)
		.pipe(uglifyJavascript())
		.on('error', theError => {
			printGulpPluginErrorBeautifully(theError, errorOfGlupPluginsPrintingConfigurations);
			cb();
		});
}


module.exports = {
	buildCSSStylus,
	buildCSSLESS,
	// buildCSSSass,
	minifyJavascript,

	default: gulpParallel(
		buildCSSStylus,
		buildCSSLESS,
		minifyJavascript
	),
};
