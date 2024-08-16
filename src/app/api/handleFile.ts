import { Context, Telegraf } from "telegraf";

export const fileHandle = async (ctx: Context<any> , next: any, bot: Telegraf) => {
  if(!ctx.message?.document || ctx.message.chat?.type != "private")
    return next();
    try {
      let res = await bot.telegram.copyMessage(process.env.TEST_CHAT as string | number, ctx.chat?.id, ctx.message?.message_id)

    await ctx.reply("Your Token: " + res.message_id)
} catch (error) {
    ctx.reply("Something went wrong") 
}
}