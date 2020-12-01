const functions = require('./');
const { emoji, sleep } = require('../');
const { readData, writeData } = require('../data');
const main = require('../../index');


const destiny = async (client, message, params, channelEmoji) => {
    let type, pointNameLight, pointNameDark;
    let destinyBalance = await readData(client, message, 'destinyBalance');
    if (channelEmoji === 'genesys') {
        type = 'Story';
        pointNameLight = 'Player';
        pointNameDark = 'GM';
    } else {
        type = 'Destiny';
        pointNameLight = 'Lightside';
        pointNameDark = 'Darkside';
    }

    if (Object.keys(destinyBalance).length === 0) destinyBalance = initDestinyBalance();

    //!destiny commands
    switch(params[0]) {
        //Sets Destiny balance per color
        case 'set':
        case 's':
            destinyBalance = initDestinyBalance();
            //check if numbers are used
            if (params.length > 1) {
                if (params[1].match(/\d+/g)) {
                    for(let i = 0; i < params.length; i++) {
                        let color = params[i].replace(/\d/g, '');
                        let amount = params[i].replace(/\D/g, '');
                        switch(color) {
                            case 'l':
                            case 'p':
                                destinyBalance.light = amount;
                                break;
                            case 'd':
                            case 'g':
                                destinyBalance.dark = amount;
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    for(let i = 0; i < params[1].length; i++) {
                        let color = params[1][i];
                        switch(color) {
                            case 'l':
                            case 'p':
                                destinyBalance.light = destinyBalance.light + 1;
                                break;
                            case 'd':
                            case 'g':
                                destinyBalance.dark = destinyBalance.dark + 1;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            break;
        case 'add':
            if (params.length > 1) {
                if (params[1].match(/\d+/g)) {
                    for(let i = 0; i < params.length; i++) {
                        let color = params[i].replace(/\d/g, '');
                        let amount = params[i].replace(/\D/g, '');
                        switch(color) {
                            case 'l':
                            case 'p':
                                destinyBalance.light += amount;
                                break;
                            case 'd':
                            case 'g':
                                destinyBalance.dark += amount;
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    for(let i = 0; i < params[1].length; i++) {
                        let color = params[1][i];
                        switch(color) {
                            case 'l':
                            case 'p':
                                destinyBalance.light = destinyBalance.light + 1;
                                break;
                            case 'd':
                            case 'g':
                                destinyBalance.dark = destinyBalance.dark + 1;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            break;
        //Reset the Destiny pool
        case 'reset':
            destinyBalance = initDestinyBalance();
            message.reply(` resets the ${type} Points`);
            break;
        //Use a lightside from the Destiny pool
        case 'light':
        case 'l':
        case 'player':
        case 'p':
            if (destinyBalance.light <= 0) {
                main.sendMessage(message, `No ${pointNameLight} points available, request will be ignored`);
                break;
            } else {
                destinyBalance.light--;
                destinyBalance.dark++;
                message.reply(` uses a ${pointNameLight} point`);
                break;
            }
        //Use a darkside from the Destiny pool
        case 'dark':
        case 'd':
        case 'gm':
        case 'g':
            if (destinyBalance.dark <= 0) {
                main.sendMessage(message, `No ${pointNameDark} points available, request will be ignored`);
                break;
            } else {
                destinyBalance.dark--;
                destinyBalance.light++;
                message.reply(` uses a ${pointNameDark} point`);
                break;
            }
        case 'roll':
        case 'r':
            let destinyRoll = await functions.roll(client, message, ['w'], channelEmoji, `${type} roll`);
            destinyBalance.light = +destinyBalance.light + +destinyRoll.results.lightpip;
            destinyBalance.dark = +destinyBalance.dark + +destinyRoll.results.darkpip;
            break;
        default:
            break;
    }
    //Prints out destiny pool to channel
    writeData(client, message, 'destinyBalance', destinyBalance);
    if (params[0] === 'r' || params[0] === 'roll') await sleep(1200);
    printDestinyBalance(destinyBalance, channelEmoji, message, type);
};

const initDestinyBalance = () => {
    return {
        light: 0,
        dark: 0,
        face: ''
    };
};

const printDestinyBalance = (destinyBalance, channelEmoji, message, type) => {
    destinyBalance.face = '';
    for(let i = 1; i <= destinyBalance.light; i++) destinyBalance.face += emoji('lightside', channelEmoji);
    for(let i = 1; i <= destinyBalance.dark; i++) destinyBalance.face += emoji('darkside', channelEmoji);
    main.sendMessage(message, `${type} Points: `);
    if (destinyBalance.face !== '') {
        if (destinyBalance.face.length > 1500) destinyBalance.face = `Too many ${type} Points to display.`;
        main.sendMessage(message, destinyBalance.face);
    }
}

exports.destiny = destiny;
