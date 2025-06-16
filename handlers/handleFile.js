const fileHandle = async (ctx, next, bot) => {
    if(!ctx.message?.document || ctx.message.chat?.type != "private")
        return next();
    try {
        let res = await bot.telegram.copyMessage(process.env.TEST_CHAT, ctx.chat?.id, ctx.message?.message_id);
        await ctx.reply("Your Token: " + res.message_id);
    } catch (error) {
        ctx.reply("Something went wrong");
    }
};

module.exports = { fileHandle };
