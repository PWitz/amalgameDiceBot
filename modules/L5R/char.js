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
            main.sendMessage(message, `${characterName} has not been set up.  Please use !char setup characterName [AIR] [EARTH] [FIRE] [WATER] [VOID] to complete setup.`);
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
                endurance: 4,
                composure: 4,
                fatigue: 0,
                strife: 0,
                vigilance: 2,
                focus: 1,
                maxVoidPoints:1,
                currentVoidPoints:1,
                honor:40,
                glory:40,
                status:30,
                rings: {
                    AIR: 1,
                    EARTH: 1,
                    FIRE: 1,
                    WATER: 1,
                    VOID: 1
                },
                money: 0,
                xp:0,
                curriculum_xp: 0,
                school_rank: 1,
                crit: [],
                obligation: {},
                duty: {}            };
            if (params[2]) character.rings.AIR = +params[2].replace(/\D/g, '');
            if (params[3]) character.rings.EARTH = +params[3].replace(/\D/g, '');
            if (params[4]) character.rings.FIRE = +params[4].replace(/\D/g, '');
            if (params[5]) character.rings.WATER = +params[5].replace(/\D/g, '');
            if (params[6]) character.rings.VOID = +params[6].replace(/\D/g, '');

            character.endurance = (character.rings.EARTH + character.rings.FIRE)*2;
            character.composure = (character.rings.EARTH + character.rings.WATER)*2;
            character.focus = character.rings.FIRE + character.rings.AIR;
            character.vigilance = Math.ceil((character.rings.WATER + character.rings.AIR)/2);
            character.maxVoidPoints = character.rings.VOID;
            character.currentVoidPoints = Math.ceil(character.rings.VOID/2);

            text += buildCharacterStatus(characterName, character);
            break;

        case 'honor':
        case 'h':
        case 'glory':
        case 'g':
        case 'status':
        case 'st':
            if(command=="honor"||command=="h") type="honor";
            if(command=="glory"||command=="g") type="glory";
            if(command=="status"||command=="st") type="status";
            if(modifier){
                character[type]+=modifier;
                if(character[type]>100) character[type]=100;
                if(character[type]<0) character[type]=0;
                if (modifier>0) text += `${characterName} has gained ${modifier} ${type}, for a total of ${character[type]} ${type}.`;
                if (modifier<0) text += `${characterName} has lost ${modifier} ${type}, for a total of ${character[type]} ${type}.`
            }
            break;
        
        case 'ring':
        case 'r':

            if (params[3]) ring = params[3].toUpperCase();
            if (!ring) {
                text += `No ring was entered.`;
                break;
            }

            if (modifier){
                character.rings[ring] = +character.rings[ring] +modifier;
            }
            if (character.rings[ring] > 5) text += `Careful ! ${characterName}'s affinity with ${ring} has exceeded human limits.`
            if (character.rings[ring] < 1) character.rings[ring] = 1;
            text += `\n${characterName}'s ${ring} Ring is now ${character.rings[ring]}`; 

            if (ring=='AIR'){
                character.focus = character.rings.FIRE + character.rings.AIR;
                character.vigilance = Math.ceil((character.rings.WATER + character.rings.AIR)/2);
                text += `\n${characterName} has now ${character.focus} focus and ${character.vigilance} vigilance.`
            }
            else if (ring=='EARTH'){
                character.endurance = (character.rings.EARTH + character.rings.FIRE)*2;
                character.composure = (character.rings.EARTH + character.rings.WATER)*2;
                text += `\n${characterName} has now ${character.endurance} endurance and ${character.vigilance} composure.`
            }
            else if (ring=='FIRE'){
                character.focus = character.rings.FIRE + character.rings.AIR;
                character.endurance = (character.rings.EARTH + character.rings.FIRE)*2;
                text += `\n${characterName} has now ${character.focus} focus and ${character.endurance} endurance.`
            }
            else if (ring=='WATER'){
                character.vigilance = Math.ceil((character.rings.WATER + character.rings.AIR)/2);
                character.composure = (character.rings.EARTH + character.rings.WATER)*2;
                text += `\n${characterName} has now ${character.composure} composure and ${character.vigilance} vigilance.`
            }
            else if (ring=='VOID'){
                character.maxVoidPoints = character.rings.VOID;
                text+=`\n${characterName} has now ${character.maxVoidPoints} maxVoidPoints.`
            }
        
        break;

        case 'voidpoint':
        case 'vp':
        case 'v':
            if (modifier) {
                if (modifier + +character.currentVoidPoints > +character.maxVoidPoints){
                    text += `${characterName} cannot have more than ${character.maxVoidPoints} void points.`
                    break;
                }
                character.currentVoidPoints+=modifier;
                if (character.currentVoidPoints<0) {
                    character.currentVoidPoints =0;
                    text+=`\n${characterName} has now 0 void points.`;
                }
            }
            break;

        case 'damage':
        case 'fatigue':
        case 'f':
        case 'wound':
        case 'w':
            if (modifier) {
                character.fatigue = +character.fatigue + modifier;
                if (modifier > 0) text += `${characterName} takes ${modifier} damages`;
                if (modifier < 0) text += `${characterName} recovers from ${-modifier} damages.`;
            }
            if (+character.fatigue < 0) character.fatigue = 0;
            text += `\nFatigue: \`${character.fatigue} / ${character.endurance}\``;
            if (+character.fatigue > +character.endurance) text += `\n${characterName} is incapacitated.`;
            break;

        case 'strife':
        case 's':
            if (modifier) {
                character.strife = +character.strife + modifier;
                if (modifier > 0) text += `${characterName} takes ${modifier} strife`;
                else if (modifier < 0) text += `${characterName} recovers from ${-modifier} strife.`;
            }
            if (+character.strife < 0) character.strife = 0;
            text += `\nStrife: \`${character.strife} / ${character.composure}\``;
            if (+character.strife > +character.composure) text += `\n${characterName} is compromised.`;
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
        case 'misc':
        case 'm':
            if (command === 'o' || command === 'obligation') type = 'obligation';
            if (command === 'd' || command === 'duty') type = 'duty';
            if (command === 'i' || command === 'inventory') type = 'inventory';
            if (command === 'm' || command === 'misc') type = 'misc';
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

        case 'koku':
        case 'k':
        case 'kokus':
        case 'bu':
        case 'b':
        case 'bus':
        case 'zeni':
        case 'zenis':
        case 'z':
            if(command === 'koku' || command === 'kokus' || command === 'k') {
                money_modifier = modifier*50;
                coin = 'kokus';
            }
            if(command === 'bu' || command === 'bus' || command === 'b') {
                money_modifier = modifier*10;
                coin = 'bus';
            }
            if(command === 'zeni' || command === 'zenis' || command === 'z') {
                money_modifier = modifier;
                coin = 'zenis';
            }
            if (modifier>0 || character.money >= -money_modifier){
                character.money+=money_modifier;
                if (modifier>0) text+= `${characterName} gets ${modifier} ${coin}.`
                if (modifier<0) text+= `${characterName} pays ${modifier} ${coin}.`
            } else text += `${characterName} does not have ${-modifier} ${coin}!`;
            zeni = character.money % 10;
            bu = ((character.money-zeni)/10) % 5;
            koku = ((character.money-zeni)/10 -bu)/5;
            text += `\n${characterName} has ${koku} kokus, ${bu} bus and ${zeni} zenis.`;
            break;

        case 'xp':
            if (modifier){
                character.xp+=modifier;
                if(modifier>0) text += `${characterName} has added ${modifier} to their XP, for a total of ${character.xp}`;
                else {
                    if(character.xp<0) {
                        character.xp=0;
                        txt += `${characterName} has removed all of their XP.`
                        break;
                    }
                    txt+= `${characterName} has removed ${modifier} to their XP, for a total of ${character.xp}`;
                }
            }
            break;

        case 'curriculum_xp':
        case 'cxp':
        case 'cursus':
            if (modifier){
                character.curriculum_xp+=modifier;
                if(modifier>0) text += `${characterName} has added ${modifier} to their curriculum XP, for a total of ${character.curriculum_xp}`;
                else {
                    if(character.curriculum_xp<0) {
                        character.curriculum_xp=0;
                        txt += `${characterName} has removed all of their curriculum XP.`
                        break;
                    }
                    txt+= `${characterName} has removed ${modifier} to their curriculum XP, for a total of ${character.curriculum_xp}`;
                }
            }
            break;
        
        case 'school_rank':
        case 'sr':
            if (modifier) {
                if (+character.school_rank + modifier > 6){
                    character.school_rank = 6;
                    text+=`Congratulations ! You have mastered the teachings of your school. \n\`School Rank : ${character.school_rank}\``;
                    break;
                }
                character.school_rank += modifier;
                if (character.school_rank<1) character.school_rank=1;
                text+=`Congratulations ! You have reached the ${character.school_rank} rank in your school teachings.`;
            }
            break;

        case 'show':
            text += buildCharacterStatus(characterName, character);
            break;

        case 'modify':
            let stat;
            if (params[3] === 'composure') stat = 'composure';
            else if (params[3] === 'endurances') stat = 'endurance';

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
    text+=`\n \`AIR:${character.rings.AIR}\` \`EARTH:${character.rings.EARTH}\` \`FIRE:${character.rings.FIRE}\` 
        \`WATER:${character.rings.WATER}\` \`VOID:${character.rings.VOID}\` `;

    if (character.endurance > 0) text += `\nFatigue: \`${character.fatigue} / ${character.endurance}\``;
    if (character.composure > 0) text += `\nStrife: \`${character.strife} / ${character.composure}\``;
    text+=`\nVoid Points: \`${character.currentVoidPoints} / ${character.maxVoidPoints}\``;
    text+= `\nVigilance: \`${character.vigilance}\``;
    text+= `\nFocus: \`${character.focus}\``;
    text+= `\nHonor: \`${character.honor}\``;
    text+= `\nGlory: \`${character.glory}\``;
    text+= `\nStatus: \`${character.status}\``;

    if (character.money > 0){
        zeni = character.money % 10;
        bu = ((character.money-zeni)/10) % 5;
        koku = ((character.money-zeni)/10 -bu)/5;
        text += `\nMoney: \`Koku: ${koku}\` \`Bu: ${bu}\` \`Zeni: ${zeni}\``;
    } 
    text += `\nSchool Rank: \`${character.school_rank}\``;
    if(character.xp > 0) text+= `\`XP: ${character.xp}\` `;
    if(character.curriculum_xp > 0) text += `\`Curriculum_XP: ${character.curriculum_xp}\``;
    if (character.crit.length > 0) text += `\nCrits: \`${character.crit}\``;
    ['obligation', 'duty', 'inventory', 'misc'].forEach(type => {
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
    if ((character.endurance < character.fatigue && character.endurance > 0) ||
        (character.composure < character.strife && character.composure)) {
        text += `\n\`INCAPACITATED\``;
    }
    return text;
};

exports.char = char;
