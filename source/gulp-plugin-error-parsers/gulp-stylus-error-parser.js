module.exports = function parseGulpStylusPluginError(error) {
	if (typeof error !== 'object') {
		return null;
	}

	// require('../utils/print-javascript-object')(error);

	const { message } = error;

	if (! message) {
		return null;
	}

	const posOfRestPart =  message.indexOf('\n');
	const restPartOfMessage = message.slice(posOfRestPart);
	const stacks = restPartOfMessage.split('    at ');
	const [ snippetPlusRawMessageOfTopMostStackItem ] = stacks.splice(0, 1);

	let stackTopItemFilePath = error.filename;
	let stackTopItemLineNumber = error.lineno;
	let stackTopItemColumnNumber = error.column;

	if (! stackTopItemFilePath) {
		const firstFilePathMatchingResult = message.match(/([\s\S]+):(\d+):(\d+)\n/);
		if (firstFilePathMatchingResult) {
			[
				,
				stackTopItemFilePath,
				stackTopItemLineNumber,
				stackTopItemColumnNumber,
			] = firstFilePathMatchingResult;
		}
	}

	if (! stackTopItemFilePath) {
		return null;
	}

	return {
		errorType: error.name,

		stackTopItem: {
			path:                                  stackTopItemFilePath,
			lineNumber:                            stackTopItemLineNumber,
			columnNumber:                          stackTopItemColumnNumber,
			involvedSnippet:                       snippetPlusRawMessageOfTopMostStackItem,
			involvedSnippetKeyLineIndexInTheArray: NaN,
			conclusionMessage:                     null,
		},

		deeperStacks: stacks,
	};
};