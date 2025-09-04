import { Telegraf } from 'telegraf';
import { botToken } from './config.js';
const bot = new Telegraf(botToken, { handlerTimeout: 1000000 });

export default bot;