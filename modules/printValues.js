const config = require('../config.json');
const emoji = require('../emoji.json');

const print = async (str, client, channelEmoji) => {
    const emojiArray = await client.shard.broadcastEval(`(${findGuild}).call(this, '${config[channelEmoji]}', '${str}')`);
    return emojiArray.find(emoji => emoji);
};

const findGuild = (guildID, emojiID) => {
    const guild = this.guilds.cache.get(guildID);
    if (!guild) return emojiID;
    const emoji = guild.emojis.cache.find(val => val.name === emojiID);
    return emoji ? emoji.toString() : emojiID;
};

const emojiSearch = (string, type = 'swrpg') => emoji[type][string];

exports.emoji = emojiSearch;
exports.print = print;
