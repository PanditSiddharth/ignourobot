const { Context } = require("telegraf")
const { Update, Message } = require("telegraf/types")
const { getCodeResponse, getAiResponse, getHelpResponse } = require("../api/fetchAiResponse");
// const fetchGradeCard = require("../api/fetchGradeCard");
const { getEnrolmentAndCode } = require("../utils/helpers");
const { getMarksCard, getFormattedGrade, statusHandler, getStatus } = require("./getFormattedResult");
const { getStatusData } = require("../api/status");
const search = require("../api/search");


/**
 * 
 * @param {import("telegraf").NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>} ctx 
 * @param {*} next 
 */
const aiHandler = async (ctx, next) => {

    if (!ctx.message || !ctx.message.text || !ctx.message.text?.trim().match(/^ai/i)) {
        return next();
    }
    ctx.message.text = ctx.message.text.replace(/^ai/i, "").trim();

    const aiCode = await getCodeResponse(ctx.message.text);
    console.log(aiCode)
    if (aiCode == "GRADECODE") {
        const ec = getEnrolmentAndCode(ctx.message.text)
        const marks = await getFormattedGrade(ec.enrollment, ec.code)
        ctx.reply(marks, { parse_mode: "MarkdownV2" })
        // fetchGradeCard()
    } else if (aiCode == "HELPCODE") {
        async function handle(ctx) {
            await ctx.reply(await getHelpResponse(ctx.message.text, ctx));
        }
        handle(ctx).catch(console.log)
    } else if (aiCode == "MARKCODE") {
        const ec = getEnrolmentAndCode(ctx.message.text)
        if (!ec.code)
            return ctx.reply("Program code ke sath me enrollment number bhejo")
        const marks = await getMarksCard(ec.enrollment, ec.code)
        ctx.reply(marks, { parse_mode: "MarkdownV2" })
    } else if (aiCode == "NOENRCODE") {
        return ctx.reply("Enrollment number ke bina marks nahi mil sakte. Enrollment number program code ke sath bhejo.")
    } else if (aiCode == "SEARCHCODE") {
        const s = await search(ctx.message.text);
        console.log(s)
        if (s)
            ctx.reply("Web Search:\n" + s)
    } else if (aiCode == "STSCODE") {
        // ctx.deleteMessage().catch(console.log)
        const dt = getEnrolmentAndCode(ctx.message.text)
        const status = await getStatus(dt.enrollment, dt.code)
        if (status)
            await ctx.reply(status, { parse_mode: "MarkdownV2" });
        else
            ctx.reply("Something went wrong in fetching status")
    } else {
        const ai = await getAiResponse(ctx.message.text)
        console.log(ai)
        if (ai) {
            await ctx.reply(ai);
        } else {
            await ctx.reply("Kuch samajh nahi aaya, please thoda aur clear likho ya help ke liye /help bhejo.");
        }
    }
}

module.exports = aiHandler