const config = require('../config.json');
const { random, toLower, sum } = require('lodash');
const { readData } = require('./data');
const main = require('../index');

const dice = sides => random(1, sides);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const asyncForEach = async (array, callback) => {
    for(let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

const polyhedral = (sides, str, message) => {
    let total = 0, r = 0, text = '', modifier;
    if (str.length > 0) modifier = +(str[str.length - 1]).replace(/\D/g, '');
    //no modifier
    if (str.length < 1) {
        total = dice(sides);
        text = ` rolled a d${sides}: ${total}`;
        //addition modifier
    } else if (str.some(e => e.includes('+'))) {
        r = dice(sides);
        total = r + modifier;
        text = ` rolled a d${sides}: ${r} + ${modifier} for at total of ${total}`;
        //subtraction modifier
    } else if (str.some(e => e.includes('-'))) {
        r = dice(sides);
        total = r - modifier;
        text = ` rolled a d${sides}: ${r} - ${modifier} for a total of ${total}`;
    }
    message.reply(text);
    return total;
};

const buildPrefix = async (client, message) => {
    let prefix = main.serverPrefixes[message.guild.id];

    if (!prefix) prefix = await readData(client, message, 'prefix');
    if (!prefix) prefix = config.prefix;

    main.addPrefix(message, prefix);

    if (message.content.includes(client.user.id) && message.content.includes('prefix')) {
        main.sendMessage(message, `${client.user.username} is using ${prefix} as the activator for this server`);
    }
    //Ignore messages that dont include with the command symbol
    if (!message.content.includes(prefix)) {
        return;
    }

    return prefix;
};

const buildParams = (message, prefix) => {
    let params = message.content.split(' ');
    if (!params[0].startsWith(prefix)) {
        let newParams = false;
        params.forEach((param, index) => {
            if (param.startsWith(prefix)) newParams = params.slice(index);
        });
        if (!newParams) return;
        params = newParams;
    }
    //remove user mentions
    params.forEach((param, index) => {
        if (param.includes('<') && param.includes('>')) params.splice(index, 1);
    });

    return params;
};

const buildCommand = (params) => {
    //create command
    if (!params[0]) return [false, params];
    let command = params[0].slice(1);
    params = params.slice(1);
    return [toLower(command), params];
};

const buildDescriptor = (params) => {
    let beg, end, desc = [];

    params.forEach((param, index) => {
        if (param.match(/['"`“”]/g)) {
            if (beg === undefined) {
                beg = index;
                end = index;
            } else end = index;
        }
    });

    if (beg !== undefined && end !== undefined) {
        desc = params.slice(beg, end + 1);
        params.splice(beg, end + 1 - beg);
        desc.forEach((word, index) => desc[index] = word.replace(/['"`“”]/g, ''));
        desc = desc.join(' ');
    }
    return [desc, params];
};

const buildStats = (client, message) => {
    main.sendMessage(message, `Currently there are ${client.shard.count} shards.`);
    client.shard.broadcastEval('this.guilds.cache.size')
        .then(results => main.sendMessage(message, `Currently on ${results.reduce((prev, val) => prev + val, 0)} servers.`))
        .catch(console.error);
    client.shard.broadcastEval(`(${buildMemberList}).call(this)`)
        .then(list => main.sendMessage(message, `Currently assisting ${sum(list)} users.`))
        .catch(console.error);
};

const buildMemberList = () => {
    let users = 0;
    this.guilds.cache.forEach(guild => users += +guild.memberCount);
    return users;
};

const checkPatreon = (client, authorID) => {
    return new Promise((resolve, reject) => {
        client.shard.broadcastEval(`(${checkRoles}).call(this, '${authorID}', '${config.patreonGuild}', '${config.patronDiceRole}')`)
            .then(array => resolve(array.some(toggle => toggle)))
            .catch(reject);
    });
};

const checkPatreonServer = (client, ownerID) => {
    return new Promise((resolve, reject) => {
        client.shard.broadcastEval(`(${checkRoles}).call(this, '${ownerID}', '${config.patreonGuild}', '${config.patronMegaRole}')`)
            .then(array => resolve(array.some(toggle => toggle)))
            .catch(reject);
    });
};

const checkRoles = (userID, patreonGuild, patronRole) => {
    const guild = this.guilds.cache.get(patreonGuild);
    if (!guild) return null;
    return guild.roles.cache.get(patronRole).members.some(member => member.user.id === userID);
};

exports.buildCommand = buildCommand;
exports.buildDescriptor = buildDescriptor;
exports.buildParams = buildParams;
exports.buildPrefix = buildPrefix;
exports.buildStats = buildStats;
exports.checkPatreon = checkPatreon;
exports.checkPatreonServer = checkPatreonServer;
exports.asyncForEach = asyncForEach;
exports.dice = dice;
exports.modifierRoll = polyhedral;
exports.sleep = sleep;


