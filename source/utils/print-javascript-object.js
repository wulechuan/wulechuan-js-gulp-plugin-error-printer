const chalk = require('chalk');

const blankLinesCountBetweenEntries = 1;

function printLine(width, color) {
	console.log(chalk[color || 'gray']('─'.repeat(width || 51)));
}

const blankLineCharsCountBetweenEntries = blankLinesCountBetweenEntries - 1;

module.exports = function printObjectInfo(input) {
	const inputType = typeof input;
	if (inputType === 'undefined') {
		console.log(`${chalk.magenta('undefined')}`);
		printLine();
		console.log('\n'.repeat(blankLineCharsCountBetweenEntries));

		return;
	}

	if (inputType !== 'object') {
		console.log(`${chalk.green(`<${inputType}>`)}: ${chalk.yellow(input.constructor.name)}`);
		console.log(input);
		printLine();
		console.log('\n'.repeat(blankLineCharsCountBetweenEntries));

		return;
	}

	if (! input) {
		console.log(`${chalk.green('<null>')}: ${chalk.yellow('Object')}`);
		printLine();
		console.log('\n'.repeat(blankLineCharsCountBetweenEntries));

		return;
	}

	console.log(chalk.blue('Input is an object'), 'constructor:', chalk.yellow(input.constructor.name));
	printLine();

	const entries = Object.entries(input);
	entries.forEach(entry => {
		const [ , value] = entry;
		const valueType = typeof value;

		let specialValueOrConstructorName;

		if (valueType === 'undefined' || valueType === 'null') {
			specialValueOrConstructorName = chalk.magenta(valueType);
			return;
		} else if (valueType === 'number' && isNaN(value)) {
			specialValueOrConstructorName = `${chalk.yellow('Number')}:${chalk.magenta('NaN')}`;
		} else {
			specialValueOrConstructorName = chalk.yellow(value.constructor.name);
		}

		console.log(`${chalk.green(entry[0])}: ${specialValueOrConstructorName}`);

		if (Array.isArray(value)) {
			console.log(JSON.stringify(value, null, 4));
		} else {
			console.log(value);
		}

		printLine();
		console.log('\n'.repeat(blankLineCharsCountBetweenEntries));
	});
};
