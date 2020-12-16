const {MessageEmbed} = require('discord.js');
const main = require('../../index');

const help = (topic, message, prefix) => {
	const embed = new MessageEmbed().setColor('ab0f1a');
	switch (topic) {
		case `roll`:
		case 'r':
			embed.setTitle('**Roll Help**')
				.setDescription(`*${prefix}roll diceIdentifiers "text"*`)
				.addField(
					`diceIdentifiers`,
					`**white/w/skill/s** = skill die
					**black/b/blk/ring/r** = ring die
					**explosiveSuccess/exp/e** = explosive success
					**success/suc/+** = success
					**opportunity/o** = opportunity
					**strife/str/t** = strife`)
				.addField('text', `assigns a label to the roll. (optional)`)
				.addField('Examples',
					`\`\`\`${prefix}roll wwbb\`\`\` (must use single character identifiers)
    				\`\`\`${prefix}roll 2skill 2ring\`\`\` (must specify a number before each identifier)`);
			break;
		case 'polyhedral':
		case 'poly':
		case 'p':
			embed.setTitle('**Polyhedral Roll Help**')
				.addField(`${prefix}poly`, 'Rolls any combination of polyhedral dice with modifier.')
				.addField(`Examples`, `\`\`\`${prefix}poly 1d4 2d6+1 1d100-60\`\`\``);
			break;
		case 'reroll':
		case 'rr':
			embed.setTitle('**ReRoll Help**')
				.addField(`${prefix}reroll/rr 13`, 'Rolls the first and third dice again.')
			break;
		case 'explode':
		case 'e':
			embed.setTitle('**Explode Help**')
				.addField(`${prefix}explode/e 13`, 'if first and third dice have explosive successes, rolls a new die for each.')
			break;
		case 'character':
		case 'char':
		case 'c':
			embed.setTitle('**Character Help**')
					.addField(`${prefix}char`, 'Simple character stat manager.')
					.addField(`${prefix}char setup/add characterName air earth fire water void`, 'Setup a new character.')
					.addField(`${prefix}char honor/h characterName +X/-X`, 'Increases/decreases honor for characterName by x.')
					.addField(`${prefix}char glory/g characterName +X/-X`, 'Increases/decreases glory for characterName by x.')
					.addField(`${prefix}char status/st characterName +X/-X`, 'Increases/decreases status for characterName by x.')
					.addField(`${prefix}char ring/r characterName +X/-X air/earth/fire/water/void`, 'Increases/decreases chosen ring for characterName by x. Derived attributes are recomputed')
					.addField(`${prefix}char voidpoint/vp/v characterName +X/-X`, 'Increases/decreases void points for characterName by x.')
					.addField(`${prefix}char damage/fatigue/f/wound/w characterName +X/-X`, 'Increases/decreases wounds for characterName by x.')
					.addField(`${prefix}char strife/s characterName +X/-X`, 'Increases/decreases strife for characterName by x.')
					.addField(`${prefix}char xp characterName +X/-X`, 'Increases/decreases xp for characterName by x.')
					.addField(`${prefix}char curriculum_xp/cxp/cursus characterName +X/-X`, 'Increases/decreases curriculum_xp for characterName by x.')
					.addField(`${prefix}char school_rank/sr characterName +X/-X`, 'Increases/decreases school_rank for characterName by x.')
					.addField(`${prefix}char kokus/koku/k characterName +X/-X`, 'Increases/decreases money for characterName by x kokus.')
					.addField(`${prefix}char bus/bu/b characterName +X/-X`, 'Increases/decreases money for characterName by x bus.')
					.addField(`${prefix}char zenis/zeni/z characterName +X/-X`, 'Increases/decreases money for characterName by x zenis.')
					.addField(`${prefix}char crit characterName +X/-X`, 'Adds/removes critical injuries for characterName.')
					.addField(`${prefix}char obligation/o characterName +X/-X obligationName`, 'Adds/removes obligations for characterName.')
					.addField(`${prefix}char duty/d characterName +X/-X dutyName`, 'Adds/removes duty for characterName.')
					.addField(`${prefix}char inventory/i characterName +X/-X itemName`, 'Adds/removes inventory items for characterName.')
					.addField(`${prefix}char misc/m characterName +X/-X miscName`, 'Adds/removes miscellanous things for characterName.')
					.addField(`${prefix}char modify characterName +X/-X maxStrain/maxWounds`, 'Increases/decreases selected stat for characterName by x.')
					.addField(`${prefix}char show characterName`, 'Show current status for characterName.')
					.addField(`${prefix}char remove characterName`, 'Removes characterName.')
					.addField(`${prefix}char list`, 'Displays all characters.')
					.addField(`${prefix}char reset`, 'Resets all the characters.');
			break;
		default:
			embed.setTitle('**Help Contents**')
				.setDescription(`'${prefix}Help [topic]' for further information.`)
				.addField(`${prefix}swrpg`, 'Uses swrpg dice for this channel.')
				.addField(`${prefix}genesys`, 'Uses genesys dice for this channel.')
				.addField(`${prefix}l5r`, 'Uses l5r dice in this channel.')
				.addField(`${prefix}poly`, 'Rolls any combination of polyhedral dice.')
				.addField(`${prefix}ver`, 'Displays bot version.')
				.addField(`${prefix}prefix`, 'Changes the prefix to activate the bot (role needs to be higher than the bot).')
				.addField(`${prefix}help`, 'Displays help for topics.')
				.addField(`${prefix}roll/r`, 'Rolls any combination of L5R dice.')
				.addField(`${prefix}keep/k`, `ie ${prefix}keep 12 - keeps the first, second, and discards the rest of the dice.`)
				.addField(`${prefix}add/a`, `ie ${prefix}add ww - adds specified dice to previous dicepool.`)
				.addField(`${prefix}reroll/rr`, `ie ${prefix}reroll 12 - rerolls the first and second dice without modifying the rest of the dicepool`)
				.addField(`${prefix}explode/e`, `ie ${prefix}explode 12 - adds dice if the first and second dice have explosive successes without modifying the rest of the dicepool`)
				.addField('More Information', 'For more information or help join the [FFG NDS Assistant Bot server](https://discord.gg/G8au6FH)')
				.addField('Role playing games by Fantasy Flight Games', `[Edge of the Empire](https://www.fantasyflightgames.com/en/products/star-wars-edge-of-the-empire), [Force and Destiny](https://www.fantasyflightgames.com/en/products/star-wars-force-and-destiny), [Age of Rebellion](https://www.fantasyflightgames.com/en/products/star-wars-age-ofrebellion),[Genesys](https://www.fantasyflightgames.com/en/products/genesys), [Legends of the Five Rings](https://www.fantasyflightgames.com/en/legend-of-the-five-rings-roleplaying-game)`);
			break;
	}
	main.sendMessage(message, {embed});

}

exports.help = help;
