/* eslint-disable no-unused-vars */
const COLOR_ANSI_BLACK   = 'black';
const COLOR_ANSI_GRAY    = 'gray';
const COLOR_ANSI_WHITE   = 'white';
const COLOR_ANSI_RED     = 'red';
const COLOR_ANSI_YELLOW  = 'yellow';
const COLOR_ANSI_GREEN   = 'green';
const COLOR_ANSI_CYAN    = 'cyan';
const COLOR_ANSI_BLUE    = 'blue';
const COLOR_ANSI_MAGENTA = 'magenta';
/* eslint-enable no-unused-vars */

module.exports = {
	colorTheme: {
		timestampTextColor:      COLOR_ANSI_GRAY,
		lineTailSymbolTextColor: COLOR_ANSI_GRAY,

		heading: {
			lineColor:                   COLOR_ANSI_RED,
			invlovedPluginNameTextColor: COLOR_ANSI_BLACK,
			invlovedPluginNameBgndColor: COLOR_ANSI_WHITE,
			errorTypeInfoTextColor:      COLOR_ANSI_BLACK,
			errorTypeInfoBgndColor:      COLOR_ANSI_MAGENTA,
		},

		ending: {
			lineColor:                   COLOR_ANSI_RED,
			normalTextColor:             COLOR_ANSI_RED,
			invlovedPluginNameTextColor: COLOR_ANSI_WHITE,
			invlovedPluginNameBgndColor: null,
			errorTypeInfoTextColor:      COLOR_ANSI_RED,
			errorTypeInfoBgndColor:      null,
		},

		stackSectionLabel: {
			textColor: COLOR_ANSI_BLACK,
			bgndColor: COLOR_ANSI_BLUE,
		},

		conclusionMessage: {
			labelTextColor:   COLOR_ANSI_BLACK,
			labelBgndColor:   COLOR_ANSI_YELLOW,
			messageTextColor: COLOR_ANSI_YELLOW,
			messageBgndColor: null,
		},

		fileInfo: {
			clickableLinkageTextColor: COLOR_ANSI_GRAY,
			pathNormalTextColor:       COLOR_ANSI_GRAY,
			pathLeafFolderTextColor:   COLOR_ANSI_BLUE,
			fileNameTextColor:         COLOR_ANSI_MAGENTA,
			lineNumberTextColor:       COLOR_ANSI_GREEN,
			columnNumberTextColor:     COLOR_ANSI_GREEN,
		},

		involvedSnippet: {
			normalTextColor:            null,
			keyLineTextColor:           COLOR_ANSI_GREEN,
			keyLineDecorationLineColor: COLOR_ANSI_RED,
		},

		callingStacks: {
			stackDetailTextColor: COLOR_ANSI_GREEN,
		},
	},
};