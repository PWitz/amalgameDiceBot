let functions = require('.');
const { readData, writeData } = require('../data');
const main = require('../../index');

const initiative = async (client, message, params, channelEmoji) => {
    let initiativeOrder = await readData(client, message, 'initiativeOrder');
    let merge = false;
    let write = true;
    if (Object.keys(initiativeOrder).length === 0) initiativeOrder = initializeInitOrder();
    if (!initiativeOrder.newslots) initiativeOrder.newslots = [];
    if (!initiativeOrder.slots) initiativeOrder.slots = [];
    let command = params.shift();
    switch(command) {
        //roll for initiativeOrder
        case 'roll':
        case 'r':
            merge = true;
            if (!params[0] || params.length === 1) {
                main.sendMessage(message, 'No dice defined.  ie \'!init roll yygg characterName\'');
                return;
            }

            let characterName = params.pop();

            if (initiativeOrder.slots.some(e => e.character==characterName) || initiativeOrder.newslots.some(e => e.character==characterName)){
                main.sendMessage(message, `Character ${characterName} is already in initiative order.`);
                return;
            }

            // let type = params.pop();
            let diceResult = await functions.roll(client, message, params, channelEmoji, 'Initiative roll');
            diceResult = diceResult.results;
            let rollResult = {
                success: diceResult.success,
                advantage: diceResult.advantage,
                triumph: diceResult.triumph,
                character: characterName
            };
            if (initiativeOrder.turn !== 1) {
                initiativeOrder.newslots.push(rollResult);
                main.sendMessage(message, `${characterName} will be added to the initiative order in the next round`)
            } else {
                initiativeOrder.slots.push(rollResult);
            }
            break;
        
        //manually set initiativeOrder
        case 'set':
        case 's':
            initiativeOrder = initializeInitOrder();
            if (!params[0]) {
                main.sendMessage(message, 'No Initiative Order defined.  ie \'!init set char1 char2 ...\'');
                break;
            }
            if ((new Set(params)).size!==params.length) {
                main.sendMessage(message, 'Duplicates characters were given.');
                break;
            }
            params.forEach(char => initiativeOrder.slots.push({ character: char}))
            break;
            
        //Reset the initiativeOrder
        case 'reset':
            initiativeOrder = initializeInitOrder();
            message.reply(' resets the Initiative Order').catch(console.error);
            break;
        //advance to next Initiative slot
        case 'next':
        case 'n':
            if (initiativeOrder.turn + 1 > initiativeOrder.slots.length) {
                initiativeOrder.turn = 1;
                initiativeOrder.round++;
                main.sendMessage(message, 'New Round!');
                if (initiativeOrder.newslots.length > 0) {
                    initiativeOrder.slots = initiativeOrder.slots.concat(initiativeOrder.newslots);
                    initiativeOrder.newslots = [];
                }
            } else initiativeOrder.turn++;
            break;
        //previous Initiative slot
        case 'previous':
        case 'p':
            if (initiativeOrder.turn === 1 && initiativeOrder.round === 1) {
                main.sendMessage(message, 'Initiative is already at the starting turn!');
            } else if (initiativeOrder.turn - 1 < 1) {
                initiativeOrder.turn = initiativeOrder.slots.length;
                initiativeOrder.round--;
                main.sendMessage(message, 'Previous Round!');
            } else initiativeOrder.turn--;
            break;

        //manually modify the initiativeOrder
        case 'modify':
            //check if numbers are used
            if (!params[0]) {
                main.sendMessage(message, 'No Initiative Order defined.  ie \'!init set char1 char2 ...\'');
                break;
            }
            initiativeOrder.slots = [];
            params.forEach(char => initiativeOrder.slots.push({ character: char}))
            break;

        case 'remove':
                let slot;
            if (isNaN(params[0])){
                slot = initiativeOrder.slots.map(e => e.character).indexOf(params[0])+1;
                console.log(initiativeOrder.slots, slot, params[0]);
            }
            else {
                slot = +params[0];
            }
            if (Object.keys(initiativeOrder.slots[0]).length >
                1) initiativeOrder = sortInitiativeOrder(initiativeOrder);
            if (initiativeOrder.slots.length >= slot - 1) {
                message.reply(`Removing ${initiativeOrder.slots[slot - 1].character} from slot ${slot}`);
                initiativeOrder.slots.splice(slot - 1, 1); 
                if (slot < initiativeOrder.turn) initiativeOrder.turn--;
            } else if(!isNaN(params[0])) message.reply(`There are not ${slot} slots!`);
            else message.reply(`There is no ${params[0]}!`)
            break;
        default:
            write = false;
            break;
    }
    if(write) {
        writeData(client, message, 'initiativeOrder', initiativeOrder, merge);
    }
    if (initiativeOrder.slots[0]) printInitiativeOrder(initiativeOrder, message);
    else main.sendMessage(message, 'No initiative order is set!');
};

//Adds a roll to the order and sorts it
const sortInitiativeOrder = (initiativeOrder) => {
    initiativeOrder.slots.sort((a, b) => {
        let nameA = a.character;
        let nameB = b.character;
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    ['advantage', 'success', 'triumph'].forEach((symbol) => {
        initiativeOrder.slots.sort((a, b) => {
            if (a[symbol] < b[symbol]) return -1;
            if (a[symbol] > b[symbol]) return 1;
            return 0;
        });
    });
    initiativeOrder.slots.reverse();
    return initiativeOrder;
};

//initializeInitOrder
const initializeInitOrder = () => {
    return {
        turn: 1,
        round: 1,
        slots: [],
        newslots: []
    };
}

//Prints out Initiative Order to channel
const printInitiativeOrder = (initiativeOrder, message) => {
    if (Object.keys(initiativeOrder.slots[0]).length > 1) initiativeOrder = sortInitiativeOrder(initiativeOrder);
    let order = '';
    for(let i = initiativeOrder.turn - 1; i < initiativeOrder.slots.length; i++) {
        order += initiativeOrder.slots[i].character + " ";
    }
    order += ':repeat:';
    for(let i = 0; i < initiativeOrder.turn - 1; i++) {
        order += initiativeOrder.slots[i].character+ " ";
    }
    main.sendMessage(message, 'Round: ' + initiativeOrder.round + ' Turn: ' + initiativeOrder.turn + ' Initiative Order: \n')
           ;

    if (order === '') return;
    if (order.length > 1500) order = `Initiative order too long to display.`

    main.sendMessage(message, order);
}

exports.initiative = initiative;
