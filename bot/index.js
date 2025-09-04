import { insertUserData, insertGroupData } from "./handlers.js";
import { findUserById, getBotStats } from "./statsFacade.js";
import { notifyPrivateUsers } from "./notify.js";
import { configDotenv } from "dotenv";
import { start } from "./botInfo.js";
import connect from "../main/connect.js";

import { getMarks, getSeasonButtons } from "../handlers/gradeAndMarks.js";
import { statusHandler } from "../handlers/getFormattedResult.js";
import { fetchResult } from "../api/fetchResult.js";


configDotenv();
export const runBot = async (bot) => {
// DB connect
await connect(process.env.MONGODB_URI);

// Track bot added/removed in groups
bot.on("my_chat_member", insertGroupData);

bot.command("start", start);
bot.command("help", start);
bot.command("marks", (ctx, next) => getMarks(ctx, next, insertUserData));
bot.command("sts", statusHandler); 
bot.command("result", getSeasonButtons);
bot.action(/\{\"eno/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => { });
  await ctx.deleteMessage().catch(() => { });
  await ctx.reply(await fetchResult(ctx?.match.input));
});
bot.command("me", async (ctx) => {
  const isPrivate = ctx.chat?.type === "private";

  const user = findUserById(String(ctx.from.id))
  if (!user) {
    return ctx.reply("ℹ️ You have not linked any enrollment yet. Use /marks command.");
  }

  console.log(await user)
  if(isPrivate)
  await ctx.reply(
    `👤 Your Info:\n\n`  +
    `ID: ${ctx.from.id}\n` +
    `Name: ${ctx.from.first_name} ${ctx.from.last_name || ""}\n` +
    `Username: ${ctx.from.username ?"@" + ctx.from.username : ""}\n` +
    `Enrollments you searched: ` +
    user.seenEnrollments.map(u => `
      Enrollment: ${u.enrollmentNo}
      Name: ${u.gradeCardName}
      Programme Code: ${u.programmeCode}
      `)
  );
});

bot.action("close", async (ctx) => {
  await ctx.deleteMessage().catch(() => { });
});


// /stats → show power of your bot
bot.command("stats", async (ctx) => {
  const s = await getBotStats();
  await ctx.reply(
    `📊 *Bot Stats*\n\n` +
      `👥 Users: ${s.totalUsers}\n` +
      `📑 Enrollments: ${s.totalEnrollments}\n` +
      `🔍 Fetches: ${s.totalFetches}\n` +
      `👥 Groups: ${s.totalGroups}`,
    { parse_mode: "Markdown" }
  );
});

// Admin-only broadcast to private users (exceptions allowed)
bot.command("broadcast", async (ctx) => {
  const ownerId = process.env.OWNER_ID; // set your Telegram numeric ID
  if (String(ctx.from.id) !== String(ownerId))
    return ctx.reply("🚫 Not allowed.");

  const msg =
    ctx.message.text.replace(/^\/broadcast\s*/i, "").trim() ||
    "🚨 IGNOU Results Update: Check your Grade Card now!";
  // exceptions example: skip current chat or supply IDs
  const skipped = [String(ctx.from.id)];
  const { sent, failed } = await notifyPrivateUsers(bot, msg, skipped);

  await ctx.reply(`✅ Sent: ${sent}, ❌ Failed: ${failed}`);
});
}