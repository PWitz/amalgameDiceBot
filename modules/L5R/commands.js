const functions = require('./');

async function commands(client, message, params, command, desc, channelEmoji, prefix) {
	switch (command) {
		case 'roll':
		case 'r':
			await functions.roll(params, message, client, desc, channelEmoji);
			break;
		case 'keep':
		case 'k':
			await functions.keep(params, message, client, desc, channelEmoji);
			break;
		case 'add':
		case 'a':
			await functions.roll(params, message, client, desc, channelEmoji, 'add');
			break;
		case 'reroll':
		case 'rr':
			await functions.keep(params, message, client, desc, channelEmoji, 'reroll');
			break;
		case 'explode':
		case 'e':
			await functions.keep(params, message, client, desc, channelEmoji, 'explode');
			break;
		case 'remove':
		case 'rm':
			await functions.keep(params, message, client, desc, channelEmoji, 'remove');
			break;
		case 'help':
		case 'h':
			functions.help(params[0], message, prefix);
			break;
		case 'character':
		case 'char':
			await functions.char(client, message, params, channelEmoji);
			break;
		default:
			break;
	}
}

exports.commands = commands;
