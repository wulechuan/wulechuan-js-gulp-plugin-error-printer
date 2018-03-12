module.exports = function parseGulpLESSPluginError(error) {
	if (typeof error !== 'object') {
		return null;
	}

	// const print = require('../utils/print-javascript-object')(error); return;

	const {
		message,
		type:     errorRawType,
		filename: stackTopItemFilePath, // also available as fileName (camel case).
		// index:    stackTopItemCharNumber,
		line:     stackTopItemLineNumber, // aslo available as lineNumber.
		column:   stackTopItemColumnNumber,
		// callLine, // might be NaN
		// callExtract, // might be undefined
		extract: involvedSnippet, // an array
	} = error;

	if (! message) {
		return null;
	}

	if (! stackTopItemFilePath) {
		return null;
	}



	const posOfMessageUselessPart =  message.indexOf(` in file ${stackTopItemFilePath}`);
	const conclusionMessage = message.slice(0, posOfMessageUselessPart);

	return {
		errorType: `${errorRawType} Error`,

		stackTopItem: {
			path:                                  stackTopItemFilePath,
			lineNumber:                            stackTopItemLineNumber,
			columnNumber:                          stackTopItemColumnNumber,
			involvedSnippet:                       involvedSnippet,

			// For gulp-less,
			// the key line is always the second line,
			// I **GUESS**.
			involvedSnippetKeyLineIndexInTheArray: 1,

			conclusionMessage,
		},

		deeperStacks: null,
	};
};