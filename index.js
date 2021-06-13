/*
  Developed by Astrydax, aka Royalcrown28 for vampwood
  For Custom Discord Bots please email me at Astrydax@gmail.com
*/
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
const handlers = require('./handlers');
let serverPrefixes = {};
let channelEmoji = {};

client.login(config.token).catch(error => console.error(error));

client.on('message', msg => handlers.onMessage(msg, client));
client.on('ready', () => handlers.onReady(client));

const sendMessage = (message, text, attachment) => {
    message.channel.send(text, attachment && attachment).catch(console.error);
};

const addPrefix = (message, prefix) => {
    serverPrefixes[message.guild.id] = prefix;
};
const addChannelEmoji = (message, emoji) => {
    channelEmoji[message.channel.id] = emoji;
};

exports.sendMessage = sendMessage;
exports.serverPrefixes = serverPrefixes;
exports.channelEmoji = channelEmoji;
exports.addPrefix = addPrefix;
exports.addChannelEmoji = addChannelEmoji;

