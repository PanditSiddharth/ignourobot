const { Telegraf, Context } = require("telegraf");
const getCodeResponse = require("../api/fetchAiResponse");
const aiHandler = require("../handlers/aiHandler");
const { getGrade, getMarks, inlineGrade } = require("../handlers/gradeAndMarks");
const { statusHandler } = require("../handlers/getFormattedResult");
async function handle(ctx) {
    await ctx.reply(`
Use ai for any thing 
Example:
ai what is ignou ?
ai when ignou starts it's admission ?
ai give me my result program bca enrollment 1234567890
ai my assignment status of enrollment 1234567890 program code mca_new

Or Send these commands for:
Grade Card:
/grade <enrollmentno> <programcode>
Example: /grade 123456789 BCA

Result:
/isc <enrollmentno>
Example: /isc 123456789

Assignment/practical status:
/sts <enrollmentno> <program>
Example: /sts 123456789 BCA`);
}

/**
 * 
 * @param {Telegraf<Context<import("telegraf/types").Update>>} bot 
 */
const runBot = async (bot) => {

    bot.use(async (ctx, next) => {
        if (!ctx.callbackQuery && !(ctx.message && ctx.message.text.startsWith("/")))
            return next();
        await ctx.telegram.sendMessage(process.env.TEST_CHAT,
            (ctx?.message?.text || ctx.callbackQuery.data) +
            "\nUser Id: " + ctx.from.id +
            "\nUsername: @" + ctx.from?.username);
        await next();
    });

    bot.command('start', handle);
    bot.command('help', handle);
    bot.command('grade', getGrade);
    bot.command('marks', getMarks);
    bot.command('sts', statusHandler);
    bot.action(/grade.+/i, inlineGrade)
    bot.on('message', aiHandler);
    // bot.on('message', handle);
}

module.exports = runBot