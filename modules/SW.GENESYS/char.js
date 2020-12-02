const functions = require('./');
const { readData, writeData } = require('../data');
const main = require('../../index');
const { indexOf, upperFirst } = require('lodash');

const char = async (client, message, params, channelEmoji) => {
    //setting the channel specific variables
    let characterStatus = await readData(client, message, 'characterStatus');
    let characterName, character, modifier = 0, command = 'list';

    if (params[0]) command = params[0];
    if (params[1]) characterName = params[1].toUpperCase();
    if (params[2] && +params[2]) modifier = +params[2];

    if (characterName && characterStatus[characterName]) character = { ...characterStatus[characterName] };
    if (!character && command !== 'list' && command !== 'reset') {
        if (command === 'setup' || command === 'add') {
            if (!characterName) {
                main.sendMessage(message, 'No characterName, !help char for more information');
                return;
            }
        } else {
            main.sendMessage(message, `${characterName} has not been set up.  Please use !char setup characterName [maxWound] [maxStrain] [credits] to complete setup.`);
            return;
        }
    }
    let text = '', name = '', type = '';
    switch(command) {
        case 'setup':
        case 'add':
            if (character) {
                text += `${characterName} already exists!`;
                break;
            }
            //init the new characters stats
            character = {
                maxWound: 0,
                maxStrain: 0,
                currentWound: 0,
                currentStrain: 0,
                credits: 0,
                xp: 0,
                morality: 50,
                orientation: "light",
                crit: [],
                obligation: {},
                duty: {},
            };
            if (params[2]) character.maxWound = +params[2].replace(/\D/g, '');
            if (params[3]) character.maxStrain = +params[3].replace(/\D/g, '');
            if (params[4]) character.credits = +params[4].replace(/\D/g, '');
            text += buildCharacterStatus(characterName, character);
            break;

        case 'wound':
        case 'w':
            if (modifier) {
                character.currentWound = +character.currentWound + modifier;
                if (modifier > 0) text += `${characterName} takes ${modifier} wounds`;
                if (modifier < 0) text += `${characterName} recovers from ${-modifier} wounds.`;
            }
            if (+character.currentWound < 0) character.currentWound = 0;
            if (+character.currentWound > 2 * +character.maxWound) character.currentWound = 2 * +character.maxWound;
            text += `\nWounds: \`${character.currentWound} / ${character.maxWound}\``;
            if (+character.currentWound > +character.maxWound) text += `\n${characterName} is incapacitated.`;
            break;

        case 'strain':
        case 's':
            if (modifier) {
                character.currentStrain = +character.currentStrain + modifier;
                if (modifier > 0) text += `${characterName} takes ${modifier} strain`;
                else if (modifier < 0) text += `${characterName} recovers from ${-modifier} strain.`;
            }
            if (+character.currentStrain < 0) character.currentStrain = 0;
            if (+character.currentStrain > 1 + +character.maxStrain) character.currentStrain = 1 + +character.maxStrain;
            text += `\nStrain: \`${character.currentStrain} / ${character.maxStrain}\``;
            if (+character.currentStrain > +character.maxStrain) text += `\n${characterName} is incapacitated.`;
            break;
        
        case 'xp':
            if (modifier) {
                if (modifier > 0 || +character.xp >= -modifier) {
                    character.xp = +character.xp + modifier;
                    if (modifier > 0) text += `${characterName} gets ${modifier} XP`;
                    else if (modifier < 0) text += `${characterName} pays ${-modifier} XP.`;
                } else text += `${characterName} does not have ${-modifier} XP!`;
                text += `\n${characterName} has ${character.xp} XP.`;
                break;
            }
        
        case 'morality':
        case 'm':
            if (modifier) {
                // Growing closer to the light side of the Force
                if (character.orientation=="dark" && +character.morality + modifier >= 70 && +character.morality < 70) {
                    character.orientation="light";
                    text += `${characterName} has gone to the light side of the Force.`;
                }

                if (+character.morality < 80 && +character.morality + modifier >= 80) {
                    character.maxStrain += 1;
                    text += `\n${characterName} has gained 1 max Strain.`;
                }

                if (+character.morality < 90 && +character.morality + modifier >= 90) {
                    character.maxStrain += 1;
                    character.maxWound += 1;
                    text += `\n${characterName} has gained 1 max Strain and 1 max Wound.`;
                }

                // Getting away from the light side of the force
                if (+character.morality >= 80 && +character.morality + modifier < 80) {
                    character.maxStrain -= 1;
                    text += `\n${characterName} has lost 1 max Strain.`;
                }

                if (+character.morality >= 90 && +character.morality + modifier < 90) {
                    character.maxStrain -= 1;
                    character.maxWound -= 1;
                    text += `\n${characterName} has lost 1 max Strain and 1 max Wound.`;
                }

                // Growing closer to the dark side of the Force
                if (character.orientation=="light" && +character.morality + modifier <= 30 && +character.morality>30) {
                    character.orientation="dark";
                    text += `\n${characterName} has come back to the dark side of the Force.`;
                }

                if (+character.morality > 20 && +character.morality + modifier <= 20) {
                    character.maxStrain -= 1;
                    character.maxWound += 1;
                    text += `\n${characterName} has lost 1 max Strain and gained 1 max Wound.`;
                }

                if (+character.morality > 10 && +character.morality + modifier <= 10) {
                    character.maxStrain -= 1;
                    character.maxWound += 1;
                    text += `\n${characterName} has gained 1 max Wound and lost 1 max Strain.`;
                }

                // Getting away from the dark side of the force
                if (+character.morality <= 20 && +character.morality + modifier > 20) {
                    character.maxStrain += 1;
                    character.maxWound -= 1;
                    text += `\n${characterName} has gained 1 max Strain and lost 1 max Wound.`;
                }

                if (+character.morality <= 10 && +character.morality + modifier > 10) {

                    character.maxStrain += 1;
                    character.maxWound -= 1;
                    text += `\n${characterName} has lost 1 max Wound and gained 1 max Strain.`;
                }

                character.morality = character.morality + modifier;

                if (character.morality>100) character.morality=100;
                if (character.morality<0) character.morality=0;
                text += `\nMorality: \`${character.morality}\``;
            }
            break;

        case 'orientation':
        case 'or':
            if (modifier) {
                if (modifier=="dark" && character.morality>=70) {
                    text+=`${characterName}'s morality is over 70, they cannot be on the dark side of the Force.`;
                    break;
                }
                if (modifier=="light" && character.morality<=30) {
                    text+=`${characterName}'s morality is under 30, they cannot be on the light side of the Force.`;
                    break;
                }
                if (modifier=="dark" || modifier=="light") {
                    character.orientation = modifier;
                    text+= `${characterName} has gone over to the ${modifier} side of the Force.`;
                }
                else text += `Orientation is either \`light\` or \`dark\`.`;
            }
            break;

        case 'crit':
            if (!character.crit) character.crit = [];
            if (modifier) {
                if (modifier > 0) {
                    character.crit.push(modifier);
                    text += `${characterName} has added Crit:${modifier} to their Critical Injuries.\n`;
                } else if (modifier < 0) {
                    let index = indexOf(character.crit, -modifier);
                    if (index > -1) {
                        character.crit.splice(index, 1);
                        text += `${characterName} has removed Crit:${-modifier} from their Critical Injuries.\n`;
                    } else text += `${characterName} does not have Crit:${-modifier} in their Critical Injuries.\n`;
                }
            }
            if (character.crit.length > 0) {
                text += `${characterName} has the following Critical Injuries.`;
                character.crit.sort()
                         .forEach(crit => text += `\nCrit ${crit}: ${functions.textCrit(crit, channelEmoji)}`);
            } else text += `${characterName} has no Critical Injuries.`;
            break;

        case 'obligation':
        case 'o':
        case 'd':
        case 'duty':
        case 'inventory':
        case 'i':
            if (command === 'o' || command === 'obligation') type = 'obligation';
            if (command === 'd' || command === 'duty') type = 'duty';
            if (command === 'i' || command === 'inventory') type = 'inventory';
            if (!character[type]) character[type] = {};
            if (params[3]) name = params[3].toUpperCase();
            if (!name) {
                text += `No ${type} name was entered.`;
                break;
            }
            if (modifier > 0) {
                if (character[type] === '') character[type] = {};
                if (!character[type][name]) character[type][name] = 0;
                character[type][name] += modifier;
                text += `${characterName} has added ${modifier} to their ${name} ${type}, for a total of ${character[type][name]}`;
                //subtraction modifier
            } else if (modifier < 0) {
                if (!character[type][name]) text += `${characterName} does not currently have any ${name} ${type}.`;
                else {
                    character[type][name] += modifier;
                    if (character[type][name] <= 0) {
                        text += `${characterName} has removed all of their ${name} ${type}.`;
                        delete character[type][name];
                    }
                    text += `${characterName} has removed ${modifier} from their ${name} ${type}, for a total of ${character[type][name]}`;
                }
            }
            if (Object.keys(character[type]).length === 0) text += `\n${characterName} has no ${type}.`;
            else {
                text += `\n${characterName} has the following ${type}.`;
                Object.keys(character[type]).forEach(key => text += `\n${key}: ${character[type][key]}`);
            }
            break;

        case 'credit':
        case 'credits':
        case 'c':
            if (modifier > 0 || +character.credits >= -modifier) {
                character.credits = +character.credits + modifier;
                if (modifier > 0) text += `${characterName} gets ${modifier} credits`;
                else if (modifier < 0) text += `${characterName} pays ${-modifier} credits.`;
            } else text += `${characterName} does not have ${-modifier} credits!`;
            text += `\n${characterName} has ${character.credits} credits.`;
            break;

        case 'status':
            text += buildCharacterStatus(characterName, character);
            break;

        case 'modify':
            let stat;
            if (params[3] === 'maxstrain') stat = 'maxStrain';
            else if (params[3] === 'maxwounds') stat = 'maxWound';

            if (!stat || !modifier) {
                text += 'Bad Command, !help char for more information';
                break;
            }
            character[stat] = +character[stat] + modifier;
            if (character[stat] < 0) character[stat] = 0;
            text += `${characterName}'s ${stat} is modified to ${character[stat]}`;
            break;

        case 'reset':
            text = 'Deleting all the characters.';
            characterStatus = false;
            character = false;
            break;

        case 'remove':
            character = false;
            delete characterStatus[characterName];
            text += `${characterName} has been removed.`;
            break;

        case 'list':
            if (Object.keys(characterStatus).length < 1) text += 'No characters.';
            else Object.keys(characterStatus).sort()
                       .forEach(name => text += `${buildCharacterStatus(name, characterStatus[name])}\n\n`);
            break;
        default:
            text += `Command:**${command}** not recognized`;

    }
    if (character) characterStatus[characterName] = { ...character };
    main.sendMessage(message, text);
    writeData(client, message, 'characterStatus', characterStatus);
};

const buildCharacterStatus = (name, character) => {
    let text = `__**${name}**__`;
    if (character.maxWound > 0) text += `\nWounds: \`${character.currentWound} / ${character.maxWound}\``;
    if (character.maxStrain > 0) text += `\nStrain: \`${character.currentStrain} / ${character.maxStrain}\``;
    if (character.credits > 0) text += `\nCredits: \`${character.credits}\``;
    if (character.crit.length > 0) text += `\nCrits: \`${character.crit}\``;
    text += `\nOrientation: \`${character.orientation}\``;
    text += `\nMorality: \`${character.morality} \``;
    if (character.xp > 0) text += `\nX: \`${character.xp}\``;
    ['obligation', 'duty', 'morality', 'inventory'].forEach(type => {
        if (character[type]) {
            if (Object.keys(character[type]).length > 0) {
                text += `\n${upperFirst(type)}: \``;
                Object.keys(character[type]).forEach(name => {
                    text += `${name}: ${character[type][name]}  `;
                });
                text += '\`';
            }
        }
    });
    if ((character.maxWound < character.currentWound && character.maxWound > 0) ||
        (character.maxStrain < character.currentStrain && character.maxStrain)) {
        text += `\n\`INCAPACITATED\``;
    }
    return text;
};

exports.char = char;
