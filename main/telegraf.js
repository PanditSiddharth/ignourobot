const { Telegraf } = require('telegraf');
const config = require('./config');
const bot = new Telegraf(config.botToken, { handlerTimeout: 1000000 });

module.exports = bot;