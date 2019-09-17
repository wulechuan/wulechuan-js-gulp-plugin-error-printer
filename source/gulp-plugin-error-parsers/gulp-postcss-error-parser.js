module.exports = function parseGulpUglifyJsPluginError(error) {
	if (typeof error !== 'object') {
		return null;
	}

	const shouldPrintErrorObjectForDebugging = false;
	if (shouldPrintErrorObjectForDebugging) {
		require('../utils/print-javascript-object')(error);
		return;
	}


	let reasonString = '';

	if (error.reason) {
		reasonString = `:${error.reason}`;
	}

	const { postcssNode } = error;

	let filePath;
	let lineNumber;
	let columnNumber;
	let involvedSnippet = null;
	let conclusionMessage = null;

	if (postcssNode && typeof postcssNode === 'object') {
		const { source } = postcssNode;

		if (error.message) {
			conclusionMessage = error.message;
		}

		if (!source || typeof source !== 'object') {
			return null;
		} else {
			if (source.input) {
				filePath = source.input.file;
			} else {
				filePath = '<unclear>';
			}

			lineNumber = source.start.line;
			columnNumber = source.start.column;
		}
	} else {
		filePath = error.file;
		lineNumber = error.line;
		columnNumber = error.column;

		if (error.message) {
			involvedSnippet = error.message;
		}
	}

	const stacksString = error.stack;
	let stackUsefulPart;

	if (stacksString && typeof stacksString === 'string') {
		[ stackUsefulPart ] = stacksString.split('\n    at ');
	}

	return {
		errorType: `${error.name}${reasonString}`,

		stackTopItem: {
			path: filePath,
			lineNumber,
			columnNumber,
			involvedSnippet,
			involvedSnippetKeyLineIndexInTheArray: NaN,
			conclusionMessage,
		},

		deeperStacks: stackUsefulPart,
	};
};
