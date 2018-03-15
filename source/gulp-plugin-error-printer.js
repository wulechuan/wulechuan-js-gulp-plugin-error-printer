// see also: https://github.com/gulpjs/plugin-error
// see also: https://github.com/gulpjs/plugin-error/blob/master/index.d.ts

const pathTool = require('path');

const chalk = require('chalk');

const longLineWidth  = 51;
const shortLineWidth = 24;
let headingAndEndingLinesWidth = longLineWidth;

const defaultConfigurations = require('./configurations');
const configurations = {
	...defaultConfigurations,
};

const { colorTheme } = configurations;


const printJavascriptObject = require('./utils/print-javascript-object'); // eslint-disable-line no-unused-vars


module.exports = function printGulpPluginErrorBeautifully(error, basePathToShortenPrintedFilePaths) {
	const errorParser = choosePluginErrorParseAccordingToInvolvedPluginName(error.plugin);
	if (typeof errorParser === 'function') {

		const parsedStructure = errorParser(error);
		if (parsedStructure) {
			printErrorTheComplexWay(error.plugin, parsedStructure, basePathToShortenPrintedFilePaths);
			return;
		}
	// } else {
	// 	printJavascriptObject(error);
	// 	return;
	}

	printErrorTheSimpleWay(error);
};


function choosePluginErrorParseAccordingToInvolvedPluginName(pluginName) {
	switch (pluginName) {
		case 'gulp-uglify':
			return require('./gulp-plugin-error-parsers/gulp-uglify-error-parser');
		case 'gulp-stylus':
			return require('./gulp-plugin-error-parsers/gulp-stylus-error-parser');
		case 'gulp-less':
			return require('./gulp-plugin-error-parsers/gulp-less-error-parser');
		case 'gulp-sass':
			return require('./gulp-plugin-error-parsers/gulp-sass-error-parser');
	}

	console.log(`Unspported plugin "${pluginName}"`);

	return null;
}

function parseStacksStringIntoStacksArrayTheDefaultWay(stacksString) {
	return stacksString.split('    at ');
}




function printLine(width, color) {
	console.log(chalk[color || 'gray']('─'.repeat(width || longLineWidth)));
}

function printShortLine() {
	printLine(shortLineWidth);
}

function printErrorAbstractInfo(involvedPluginName, errorTypeString) {
	headingAndEndingLinesWidth = 'HH:mm:ss '.length + involvedPluginName.length + 2 + errorTypeString.length + 2;

	console.log('\n'.repeat(2));
	printLine(headingAndEndingLinesWidth, colorTheme.heading.lineColor);

	console.log(`${
		shadingString(
			formatTimestamp(Date.now()),
			colorTheme.timestampTextColor
		)
	} ${
		shadingString(
			` ${involvedPluginName} `,
			colorTheme.heading.invlovedPluginNameTextColor,
			colorTheme.heading.invlovedPluginNameBgndColor
		)
	}${
		shadingString(
			` ${errorTypeString} `,
			colorTheme.heading.errorTypeInfoTextColor,
			colorTheme.heading.errorTypeInfoBgndColor
		)
	} ${
		shadingString(
			'╳',
			colorTheme.lineTailSymbolTextColor
		)
	}`);

	printLine(headingAndEndingLinesWidth, colorTheme.heading.lineColor);
}

function printErrorEndingInfo(involvedPluginName, errorTypeString) {
	printLine(headingAndEndingLinesWidth, colorTheme.ending.lineColor);

	console.log(`${
		shadingString(
			'  End of ',
			colorTheme.ending.normalTextColor
		)
	}${
		shadingString(
			` ${involvedPluginName} `,
			colorTheme.ending.invlovedPluginNameTextColor,
			colorTheme.ending.invlovedPluginNameBgndColor
		)
	}${
		shadingString(
			` ${errorTypeString} `,
			colorTheme.ending.errorTypeInfoTextColor,
			colorTheme.ending.errorTypeInfoBgndColor
		)
	}`);

	printLine(headingAndEndingLinesWidth, colorTheme.ending.lineColor);

	console.log('\n'.repeat(2));
}

function printConclusionMessageIfAny(errorMessage) {
	if (errorMessage) {
		console.log(`${
			shadingString(
				' Error Message ',
				colorTheme.conclusionMessage.labelTextColor,
				colorTheme.conclusionMessage.labelBgndColor
			)
		} ${
			shadingString(
				':',
				colorTheme.lineTailSymbolTextColor
			)
		}\n\n${
			shadingString(
				errorMessage,
				colorTheme.conclusionMessage.messageTextColor,
				colorTheme.conclusionMessage.messageBgndColor
			)
		}\n`);
	}
}

function printHeaderForOneItemInStack(fileFullPath, lineNumber, columnNumber, basePathToShortenPrintedFilePaths) {
	if (! fileFullPath || typeof fileFullPath !== 'string') {
		return;
	}

	if (typeof basePathToShortenPrintedFilePaths !== 'string') {
		basePathToShortenPrintedFilePaths = '';
	}

	if (! lineNumber && lineNumber !== 0) {
		lineNumber = '<Unknown>';
	}

	if (! columnNumber && columnNumber !== 0) {
		columnNumber = '<Unknown>';
	}



	// For we can easily click the file link and open the involded file in smart console,
	// e.g. console of Microsoft VSCode.
	// Besides, unfortunetly, in Microsoft VSCode, so far the version 1.20.0,
	// the file path must be short enough, or the console being wide enough,
	// so that the file path displays with a single line, can the said file path be clicked.
	console.log(`Clickable linkage:\n${
		shadingString(
			fileFullPath,
			colorTheme.fileInfo.clickableLinkageTextColor
		)
	}\n`);




	const fileRelativePath = pathTool.relative(basePathToShortenPrintedFilePaths, fileFullPath);

	const pathSegments = fileRelativePath.split(pathTool.sep);
	const fileBaseName = pathSegments.pop();
	const leafFolder = pathSegments.pop();

	let leafFolderParentPath = pathTool.dirname(fileRelativePath);
	leafFolderParentPath = pathTool.dirname(leafFolderParentPath);
	leafFolderParentPath = `${leafFolderParentPath}${pathTool.sep}`;

	console.log(`File Path: ${
		shadingString(
			leafFolderParentPath,
			colorTheme.fileInfo.pathNormalTextColor
		)
	}${
		shadingString(
			leafFolder,
			colorTheme.fileInfo.pathLeafFolderTextColor
		)
	}${
		shadingString(
			pathTool.sep,
			colorTheme.fileInfo.pathNormalTextColor
		)
	}\nFile Name: ${
		shadingString(
			fileBaseName,
			colorTheme.fileInfo.fileNameTextColor
		)
	}\nLine: ${
		shadingString(
			lineNumber,
			colorTheme.fileInfo.lineNumberTextColor
		)
	}, Column: ${
		shadingString(
			columnNumber,
			colorTheme.fileInfo.columnNumberTextColor
		)
	}`);

	printShortLine();
}

function printInvolvedSnippetLinesInAnArray(snippetLines, keyLineIndexInTheArray, errorColumnNumber, shouldPrependLineNumbers, errorLineNumber) {
	const gutterLeadingSpacesCountIfGutterIsEnabled = 2;
	const gutterLeadingSpacesIfGutterIsEnabled = ' '.repeat(gutterLeadingSpacesCountIfGutterIsEnabled);

	let maxLineNumberOfSnippet;
	let maxLineNumberStringWidthOfSnippet = 0;
	let gutterWidth = 0;
	let isAbleToBuildGutter = false;

	if (shouldPrependLineNumbers && errorLineNumber > 0) {
		isAbleToBuildGutter = true;
		maxLineNumberOfSnippet = snippetLines.length - keyLineIndexInTheArray + errorLineNumber;
		maxLineNumberStringWidthOfSnippet = `${maxLineNumberOfSnippet}`.length;
		gutterWidth = gutterLeadingSpacesCountIfGutterIsEnabled + `${maxLineNumberOfSnippet}| `.length;
	}

	snippetLines.forEach((line, lineIndexInArray) => {
		const isKeyLine = lineIndexInArray === keyLineIndexInTheArray;

		let gutterString = '';
		if (isAbleToBuildGutter) {
			const currentLineNumber = (lineIndexInArray - keyLineIndexInTheArray + errorLineNumber);
			const currentLineNumberString = `${currentLineNumber}`;
			gutterString = `${
				gutterLeadingSpacesIfGutterIsEnabled
			}${
				' '.repeat(maxLineNumberStringWidthOfSnippet - currentLineNumberString.length)
			}${
				currentLineNumber
			}| `;
		}

		if (isKeyLine) {
			const [ , leadingSpaces] = line.match(/^(\s*)\S/);

			let errorDecorationLineLength;
			let shouldPrintAnXAtWaveLineTail = true;

			if (errorColumnNumber > 0) {
				errorDecorationLineLength = Math.max(0, errorColumnNumber - leadingSpaces.length - 1);
			} else {
				shouldPrintAnXAtWaveLineTail = false;
				const lineLengthAfterItsLeadingSpaces = line.trim().length;
				errorDecorationLineLength = lineLengthAfterItsLeadingSpaces;
			}


			console.log(shadingString(
				`${gutterString}${line}`,
				colorTheme.involvedSnippet.keyLineTextColor
			));

			console.log(`${
				' '.repeat(gutterWidth)
			}${
				leadingSpaces
			}${
				shadingString(
					'~'.repeat(errorDecorationLineLength),
					colorTheme.involvedSnippet.keyLineDecorationLineColor
				)
			}${
				shouldPrintAnXAtWaveLineTail
					? shadingString(
						'╳',
						colorTheme.involvedSnippet.keyLineDecorationLineColor
					)
					: ''
			}`);
		} else {
			console.log(shadingString(
				`${gutterString}${line}`,
				colorTheme.involvedSnippet.normalTextColor
			));
		}
	});

	if (snippetLines.length > 0) {
		console.log('\n');
	}
}

function parseAndPrintDetailOfTopMostStackTheDefaultWay(involvedSnippetPlusRawErrorMessage) {
	if (! involvedSnippetPlusRawErrorMessage || typeof involvedSnippetPlusRawErrorMessage !== 'string') {
		return;
	}

	const allLineGutters = involvedSnippetPlusRawErrorMessage.match(/\n\s*\d+\|/g);
	const lastGutter = allLineGutters[allLineGutters.length - 1];
	const gutterWidth = lastGutter.length - '\n'.length;

	const posOfThingsAfterLastGutter = involvedSnippetPlusRawErrorMessage.indexOf(lastGutter) + lastGutter.length;
	const thingsAfterLastGutter = involvedSnippetPlusRawErrorMessage.slice(posOfThingsAfterLastGutter);

	const posOfRawErrorMessageOfLastFile = posOfThingsAfterLastGutter + thingsAfterLastGutter.indexOf('\n') + '\n\n'.length;

	const rawErrorMessageOfTopMostStack = involvedSnippetPlusRawErrorMessage.slice(posOfRawErrorMessageOfLastFile);

	const matchingResultOfDecorationLine = involvedSnippetPlusRawErrorMessage.match(/(\n-{5,}\^)\n/);
	const [ , errorDecorationLine] = matchingResultOfDecorationLine;
	const posOfErrorDecorationLine = involvedSnippetPlusRawErrorMessage.indexOf(errorDecorationLine);

	const snippetPart1IncludingHighlightedLine = involvedSnippetPlusRawErrorMessage.slice(0, posOfErrorDecorationLine);

	const allLinesOfSnippetPart1IncludingHighlightedLine = snippetPart1IncludingHighlightedLine.match(/\n[^\n]*/g);
	const highlightedLine = allLinesOfSnippetPart1IncludingHighlightedLine.pop();
	const snippetPart1 = allLinesOfSnippetPart1IncludingHighlightedLine.join('');
	const snippetPart2 = involvedSnippetPlusRawErrorMessage.slice(
		posOfErrorDecorationLine + errorDecorationLine.length,
		posOfRawErrorMessageOfLastFile
	);

	console.log(`${
		shadingString(
			snippetPart1,
			colorTheme.involvedSnippet.normalTextColor
		)
	}${
		shadingString(
			highlightedLine,
			colorTheme.involvedSnippet.keyLineTextColor
		)
	}\n${
		' '.repeat(gutterWidth)
	}${
		shadingString(
			'~'.repeat(errorDecorationLine.length - gutterWidth - '\n'.length - '^'.length),
			colorTheme.involvedSnippet.keyLineDecorationLineColor
		)
	}${
		shadingString(
			'╳', // ▲
			colorTheme.involvedSnippet.keyLineDecorationLineColor
		)
	}${
		shadingString(
			snippetPart2,
			colorTheme.involvedSnippet.normalTextColor
		)
	}`);

	printConclusionMessageIfAny(rawErrorMessageOfTopMostStack);
}


function printAllDeeperStackRecords(stacks, basePathToShortenPrintedFilePaths) {
	if (! Array.isArray(stacks)) {
		return;
	}

	if (stacks.length > 0) {
		console.log(`\n${
			shadingString(
				' ...more info in deeper stack ',
				colorTheme.stackSectionLabel.textColor,
				colorTheme.stackSectionLabel.bgndColor
			)
		} ${
			shadingString(
				'>',
				colorTheme.lineTailSymbolTextColor
			)
		}\n`);
	}

	stacks.forEach(stack => {
		if (typeof stack !== 'string') {
			return;
		}

		stack = stack.trim();

		if (! stack) {
			return;
		}

		const stackFileInfoPos = stack.lastIndexOf('(');
		let stackFilePath;
		let stackFileLine;
		let stackFileColumn;
		let stackDetail = stack;

		if (stackFileInfoPos >= 0) {
			stackDetail = stack.slice(0, stackFileInfoPos - 1); // There is one space before '('.
			const stackFileInfo = stack.slice(stackFileInfoPos + 1, (')\n'.length * -1));

			const matchingResult = stackFileInfo.match(/:(\d+):(\d+)/);

			if (matchingResult) {
				stackFilePath = stackFileInfo.slice(0, matchingResult.index);

				[ , stackFileLine, stackFileColumn ] = matchingResult;
			}
		}


		if (stackFilePath && stackFileLine && stackFileColumn) {
			printHeaderForOneItemInStack(stackFilePath, stackFileLine, stackFileColumn, basePathToShortenPrintedFilePaths);
		}

		console.log(`${
			shadingString(
				stackDetail,
				colorTheme.callingStacks.stackDetailTextColor
			)
		}\n\n`);
	});
}





function printErrorTheSimpleWay(error) {
	printErrorAbstractInfo(error.plugin, error.name);

	if (typeof error.toString === 'function') {
		console.log(error.toString());
	} else {
		console.log(error);
	}

	printErrorEndingInfo(error.plugin, error.name);
}

function printErrorTheComplexWay(involvedGulpPluginName, parsedStructure, basePathToShortenPrintedFilePaths) {
	printErrorAbstractInfo(involvedGulpPluginName, parsedStructure.errorType);

	const { stackTopItem } = parsedStructure;

	if (stackTopItem && typeof stackTopItem === 'object') {
		console.log(`${
			shadingString(
				' Statement in top most stack ',
				colorTheme.stackSectionLabel.textColor,
				colorTheme.stackSectionLabel.bgndColor
			)
		} ${
			shadingString(
				'>',
				colorTheme.lineTailSymbolTextColor
			)
		}\n`);

		printHeaderForOneItemInStack(
			stackTopItem.path,
			stackTopItem.lineNumber,
			stackTopItem.columnNumber,
			basePathToShortenPrintedFilePaths
		);

		if (Array.isArray(stackTopItem.involvedSnippet)) {
			printInvolvedSnippetLinesInAnArray(
				stackTopItem.involvedSnippet,
				stackTopItem.involvedSnippetKeyLineIndexInTheArray,
				stackTopItem.columnNumber,
				true,
				stackTopItem.lineNumber
			);
		} else {
			// For some plugins, the conclusion message might contain inside snippets.
			// In this case, the line below will print the included conclusion message.
			parseAndPrintDetailOfTopMostStackTheDefaultWay(stackTopItem.involvedSnippet);
		}

		// For some other plugins, the conclusion message is provided separately.
		printConclusionMessageIfAny(stackTopItem.conclusionMessage);
	}

	let { deeperStacks } = parsedStructure;
	if (deeperStacks) {
		if (typeof deeperStacks === 'string') {
			deeperStacks = parseStacksStringIntoStacksArrayTheDefaultWay(deeperStacks);
		}

		printAllDeeperStackRecords(deeperStacks, basePathToShortenPrintedFilePaths);
	}

	printErrorEndingInfo(involvedGulpPluginName, parsedStructure.errorType);
}

function formatTimestamp(timestamp) {
	const dateObjectOfTheTime = new Date(timestamp);

	const hours   = dateObjectOfTheTime.getHours();
	const minutes = dateObjectOfTheTime.getMinutes();
	const seconds = dateObjectOfTheTime.getSeconds();

	return [
		hours   < 10 ? `0${hours}`   : `${hours}`,
		minutes < 10 ? `0${minutes}` : `${minutes}`,
		seconds < 10 ? `0${seconds}` : `${seconds}`,
	].join(':');
}

function shadingString(rawString, textColor, bgndColor) {
	const textColorIsValid = !!textColor;
	const bgndColorIsValid = !!bgndColor && bgndColor !== 'gray';

	if (! textColorIsValid && ! bgndColorIsValid) {
		return rawString;
	}

	let usedChalk = chalk;

	if (bgndColorIsValid) {
		const usedBgndColor = `bg${bgndColor.slice(0, 1).toUpperCase()}${bgndColor.slice(1)}`;
		usedChalk = usedChalk[usedBgndColor];
	}

	if (textColorIsValid) {
		usedChalk = usedChalk[textColor];
	}

	return usedChalk(rawString);
}
