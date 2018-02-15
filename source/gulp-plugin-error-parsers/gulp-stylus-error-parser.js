module.exports = function parseGulpStylusPluginError(error) {
	if (typeof error !== 'object') {
		return null;
	}

	const { message } = error;

	const posOfRestPart =  message.indexOf('\n');
	const restPartOfMessage = message.slice(posOfRestPart);
	const stacks = restPartOfMessage.split('    at ');
	const [ snippetPlusRawMessageOfTopMostStackItem ] = stacks.splice(0, 1);

	return {
		errorType: error.name,

		stackTopItem: {
			path:         error.filename,
			lineNumber:   error.lineno,
			columnNumber: error.column,
			involvedSnippet: snippetPlusRawMessageOfTopMostStackItem,
			conclusionMessage: null,
		},

		deeperStacks: stacks,
	};
};