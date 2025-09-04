import User from "../models/User.js";

/**
 * Send notification to users who have DM'ed the bot at least once (isPrivate = true).
 * @param {Telegraf} bot
 * @param {string} message
 * @param {string[]} exceptions array of telegramId to skip
 * @returns {{sent:number, failed:number}}
 */
export async function notifyPrivateUsers(bot, message, exceptions = []) {
  const cursor = User.find({ isPrivate: true }).cursor();
  let sent = 0, failed = 0;

  for await (const user of cursor) {
    if (exceptions.includes(user.telegramId)) continue;
    try {
      await bot.telegram.sendMessage(user.telegramId, message);
      sent += 1;
    } catch (err) {
      failed += 1;
      // common errors: 403 (bot blocked), 400 (bad request), 429 (flood)
      console.error(`Send fail -> ${user.telegramId}:`, err.response?.error_code, err.response?.description || err.message);
    }
  }
  return { sent, failed };
}
