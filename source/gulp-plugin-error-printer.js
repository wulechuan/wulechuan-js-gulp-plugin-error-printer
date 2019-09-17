// see also: https://github.com/gulpjs/plugin-error
// see also: https://github.com/gulpjs/plugin-error/blob/master/index.d.ts

const pathTool = require('path');
const deepMerge = require('deepmerge');

const chalk = require('chalk');

const longLineWidth  = 51;
const shortLineWidth = 24;
let headingAndEndingLinesWidth = longLineWidth;

const defaultConfigurations = require('./configurations');


const printJavascriptObject = require('./utils/print-javascript-object'); // eslint-disable-line no-unused-vars


module.exports = function printGulpPluginErrorBeautifully(error, userConfigurations) {
	if (typeof userConfigurations === 'string') {
		userConfigurations = {
			basePathToShortenPrintedFilePaths: userConfigurations,
		};
	}

	let configurations = deepMerge(
		{
			basePathToShortenPrintedFilePaths: process.cwd(),
		},

		defaultConfigurations
	);

	configurations = deepMerge(
		configurations,
		userConfigurations
	);

	const errorParser = choosePluginErrorParseAccordingToInvolvedPluginName(error.plugin);
	if (typeof errorParser === 'function') {

		const parsedStructure = errorParser(error);
		if (parsedStructure) {
			printErrorTheComplexWay(error.plugin, parsedStructure, configurations);
			return;
		}
	}

	printErrorTheSimpleWay(error, configurations);
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
		default:
			console.log(`\nUnspported plugin "${pluginName}"`);
			return function() { return null; };
	}
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

function printErrorAbstractInfo(involvedPluginName, errorTypeString, colorTheme) {
	headingAndEndingLinesWidth = 'HH:mm:ss '.length + involvedPluginName.length + 2 + errorTypeString.length + 2;

	console.log('\n'.repeat(2));
	printLine(headingAndEndingLinesWidth, colorTheme.heading.lineColor);

	console.log(`${
		shadeString(
			formatTimestamp(Date.now()),
			colorTheme.timestampTextColor
		)
	} ${
		shadeString(
			` ${involvedPluginName} `,
			colorTheme.heading.invlovedPluginNameTextColor,
			colorTheme.heading.invlovedPluginNameBgndColor
		)
	}${
		shadeString(
			` ${errorTypeString} `,
			colorTheme.heading.errorTypeInfoTextColor,
			colorTheme.heading.errorTypeInfoBgndColor
		)
	} ${
		shadeString(
			'╳',
			colorTheme.lineTailSymbolTextColor
		)
	}`);

	printLine(headingAndEndingLinesWidth, colorTheme.heading.lineColor);
}

function printErrorEndingInfo(involvedPluginName, errorTypeString, colorTheme) {
	printLine(headingAndEndingLinesWidth, colorTheme.ending.lineColor);

	console.log(`${
		shadeString(
			'  End of ',
			colorTheme.ending.normalTextColor
		)
	}${
		shadeString(
			` ${involvedPluginName} `,
			colorTheme.ending.invlovedPluginNameTextColor,
			colorTheme.ending.invlovedPluginNameBgndColor
		)
	}${
		shadeString(
			` ${errorTypeString} `,
			colorTheme.ending.errorTypeInfoTextColor,
			colorTheme.ending.errorTypeInfoBgndColor
		)
	}`);

	printLine(headingAndEndingLinesWidth, colorTheme.ending.lineColor);

	console.log('\n'.repeat(2));
}

function printConclusionMessageIfAny(errorMessage, colorTheme) {
	if (errorMessage) {
		console.log(`${
			shadeString(
				' Error Message ',
				colorTheme.conclusionMessage.labelTextColor,
				colorTheme.conclusionMessage.labelBgndColor
			)
		} ${
			shadeString(
				':',
				colorTheme.lineTailSymbolTextColor
			)
		}\n\n${
			shadeString(
				errorMessage,
				colorTheme.conclusionMessage.messageTextColor,
				colorTheme.conclusionMessage.messageBgndColor
			)
		}\n`);
	}
}

function printHeaderForOneItemInStack(fileFullPath, lineNumber, columnNumber, configurations) {
	const {
		colorTheme,
		basePathToShortenPrintedFilePaths,
	} = configurations;

	if (! fileFullPath || typeof fileFullPath !== 'string') {
		return;
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
		shadeString(
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
		shadeString(
			leafFolderParentPath,
			colorTheme.fileInfo.pathNormalTextColor
		)
	}${
		shadeString(
			leafFolder,
			colorTheme.fileInfo.pathLeafFolderTextColor
		)
	}${
		shadeString(
			pathTool.sep,
			colorTheme.fileInfo.pathNormalTextColor
		)
	}\nFile Name: ${
		shadeString(
			fileBaseName,
			colorTheme.fileInfo.fileNameTextColor
		)
	}\nLine: ${
		shadeString(
			lineNumber,
			colorTheme.fileInfo.lineNumberTextColor
		)
	}, Column: ${
		shadeString(
			columnNumber,
			colorTheme.fileInfo.columnNumberTextColor
		)
	}`);

	printShortLine();
}

function printInvolvedSnippetLinesInAnArray(colorTheme, snippetLines, keyLineIndexInTheArray, errorColumnNumber, shouldPrependLineNumbers, errorLineNumber) {
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


			console.log(shadeString(
				`${gutterString}${line}`,
				colorTheme.involvedSnippet.keyLineTextColor
			));

			console.log(`${
				' '.repeat(gutterWidth)
			}${
				leadingSpaces
			}${
				shadeString(
					'~'.repeat(errorDecorationLineLength),
					colorTheme.involvedSnippet.keyLineDecorationLineColor
				)
			}${
				shouldPrintAnXAtWaveLineTail
					? shadeString(
						'╳',
						colorTheme.involvedSnippet.keyLineDecorationLineColor
					)
					: ''
			}`);
		} else {
			console.log(shadeString(
				`${gutterString}${line}`,
				colorTheme.involvedSnippet.normalTextColor
			));
		}
	});

	if (snippetLines.length > 0) {
		console.log('\n');
	}
}

function parseAndPrintDetailOfTopMostStackTheDefaultWay(involvedSnippetPlusRawErrorMessage, colorTheme) {
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
		shadeString(
			snippetPart1,
			colorTheme.involvedSnippet.normalTextColor
		)
	}${
		shadeString(
			highlightedLine,
			colorTheme.involvedSnippet.keyLineTextColor
		)
	}\n${
		' '.repeat(gutterWidth)
	}${
		shadeString(
			'~'.repeat(errorDecorationLine.length - gutterWidth - '\n'.length - '^'.length),
			colorTheme.involvedSnippet.keyLineDecorationLineColor
		)
	}${
		shadeString(
			'╳', // ▲
			colorTheme.involvedSnippet.keyLineDecorationLineColor
		)
	}${
		shadeString(
			snippetPart2,
			colorTheme.involvedSnippet.normalTextColor
		)
	}`);

	printConclusionMessageIfAny(rawErrorMessageOfTopMostStack, colorTheme);
}


function printAllDeeperStackRecords(stacks, configurations) {
	if (! Array.isArray(stacks)) {
		return;
	}

	const {
		colorTheme,
		// basePathToShortenPrintedFilePaths,
	} = configurations;

	if (stacks.length > 0) {
		console.log(`\n${
			shadeString(
				' ...more info in deeper stack ',
				colorTheme.stackSectionLabel.textColor,
				colorTheme.stackSectionLabel.bgndColor
			)
		} ${
			shadeString(
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
			printHeaderForOneItemInStack(stackFilePath, stackFileLine, stackFileColumn, configurations);
		}

		console.log(`${
			shadeString(
				stackDetail,
				colorTheme.callingStacks.stackDetailTextColor
			)
		}\n\n`);
	});
}




function shortenStringValueIfItIsWayTooLong(hostObject, propertyName, maxStringLengthToPrint, shouldNotUseChalk) {
	if (!hostObject || typeof hostObject !== 'object' || Array.isArray(hostObject)) {
		return;
	}

	if (!(maxStringLengthToPrint >= 0)) {
		maxStringLengthToPrint = 515;
	}

	if (typeof hostObject[propertyName] === 'string') {
		const rawString = hostObject[propertyName];
		const rawStringLength = rawString.length;

		if (rawStringLength > maxStringLengthToPrint) {
			if (maxStringLengthToPrint === 0) {
				delete hostObject.source;
			} else {

				if (shouldNotUseChalk) {
					hostObject.source =`${
						rawString.slice(0, maxStringLengthToPrint)
					}\nThe original "source" is way too long (${
						rawStringLength
					} chars).\nThus sliced down to [0, ${
						maxStringLengthToPrint
					}).`;
				} else {
					hostObject.source =`${
						rawString.slice(0, maxStringLengthToPrint)
					}\n${
						chalk.yellow(`The original "source" is way too long (${
							rawStringLength
						} chars).\nThus sliced down to [0, ${
							maxStringLengthToPrint
						}).`)
					}`;
				}

			}

		}
	}
}

function printErrorTheSimpleWay(error, configurations) {
	const {
		colorTheme,
		// basePathToShortenPrintedFilePaths,
	} = configurations;

	printErrorAbstractInfo(error.plugin, error.name, colorTheme);

	const errorToPrint = Object.assign({
		plugin: error.plugin, // make sure "plugin" is the first property to enumerate.
	}, error );

	errorToPrint.__proto__ = {
		constructor: error.constructor,
	};

	delete errorToPrint.__safety;

	if (error.message) {
		delete errorToPrint.source;
	} else {
		shortenStringValueIfItIsWayTooLong(errorToPrint, 'source');
	}

	delete errorToPrint.input;
	// const errorInput = errorToPrint.input;
	// if (errorInput && typeof errorInput === 'object') {
	// 	shortenStringValueIfItIsWayTooLong(errorInput, 'source', -1, true);
	// }

	if (errorToPrint.file && errorToPrint.fileName === errorToPrint.file) {
		delete errorToPrint.fileName;
	}

	if (errorToPrint.line && errorToPrint.lineNumber === errorToPrint.line) {
		delete errorToPrint.lineNumber;
	}

	if (typeof errorToPrint.showProperties === 'boolean') {
		delete errorToPrint.showProperties;
	}

	if (typeof errorToPrint.showStack === 'boolean') {
		delete errorToPrint.showStack;
	}


	// -----------------------------------------

	printJavascriptObject(errorToPrint);

	// if (typeof error.toString === 'function') {
	// 	console.log(error.toString());
	// } else {
	// 	console.log(error);
	// }

	printErrorEndingInfo(error.plugin, error.name, colorTheme);
}

function printErrorTheComplexWay(involvedGulpPluginName, parsedStructure, configurations) {
	const {
		colorTheme,
		// basePathToShortenPrintedFilePaths,
	} = configurations;

	printErrorAbstractInfo(involvedGulpPluginName, parsedStructure.errorType, colorTheme);

	const { stackTopItem } = parsedStructure;

	if (stackTopItem && typeof stackTopItem === 'object') {
		console.log(`${
			shadeString(
				' Statement in top most stack ',
				colorTheme.stackSectionLabel.textColor,
				colorTheme.stackSectionLabel.bgndColor
			)
		} ${
			shadeString(
				'>',
				colorTheme.lineTailSymbolTextColor
			)
		}\n`);

		printHeaderForOneItemInStack(
			stackTopItem.path,
			stackTopItem.lineNumber,
			stackTopItem.columnNumber,
			configurations
		);

		if (Array.isArray(stackTopItem.involvedSnippet)) {
			printInvolvedSnippetLinesInAnArray(
				colorTheme,
				stackTopItem.involvedSnippet,
				stackTopItem.involvedSnippetKeyLineIndexInTheArray,
				stackTopItem.columnNumber,
				true,
				stackTopItem.lineNumber
			);
		} else {
			// For some plugins, the conclusion message might contain inside snippets.
			// In this case, the line below will print the included conclusion message.
			parseAndPrintDetailOfTopMostStackTheDefaultWay(stackTopItem.involvedSnippet, colorTheme);
		}

		// For some other plugins, the conclusion message is provided separately.
		printConclusionMessageIfAny(stackTopItem.conclusionMessage, colorTheme);
	}

	let { deeperStacks } = parsedStructure;
	if (deeperStacks) {
		if (typeof deeperStacks === 'string') {
			deeperStacks = parseStacksStringIntoStacksArrayTheDefaultWay(deeperStacks);
		}

		printAllDeeperStackRecords(deeperStacks, configurations);
	}

	printErrorEndingInfo(involvedGulpPluginName, parsedStructure.errorType, colorTheme);
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

function shadeString(rawString, textColor, bgndColor) {
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
