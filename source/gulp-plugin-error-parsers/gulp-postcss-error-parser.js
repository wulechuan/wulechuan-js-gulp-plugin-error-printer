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

	const shouldStillUseTheSimplePrinter = true;

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

			if (source.start && typeof source.start === 'object') {
				lineNumber = source.start.line;
				columnNumber = source.start.column;
			}
		}


		if (shouldStillUseTheSimplePrinter) {
			// We will use a modified error copy,
			// and will return earlier here.

			const {
				plugin,
				name,
				fileName,
				message,
				stack,
			} = error; // first these ones, in this order

			let endLine;
			let endColumn;

			if (source.end && typeof source.end === 'object') {
				endLine   = source.end.line;
				endColumn = source.end.column;
			}

			const errorToPrint = {
				shouldStillUseTheSimplePrinter: true,

				plugin,
				name,
				file: filePath || fileName,
				startLine: lineNumber,
				startColumn: columnNumber,
				endLine,
				endColumn,
				message,
				stack,

				...error, // then all of them. but enumerate order of some properties has decided above.
			};

			delete errorToPrint.input;
			delete errorToPrint.postcssNode;

			return errorToPrint;
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

			shouldPrintInvolvedSnippetAsIs: true,
		},

		deeperStacks: stackUsefulPart,
	};
};
