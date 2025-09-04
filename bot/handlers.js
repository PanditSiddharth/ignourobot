import { upsertUser, deleteEnrollment, getBotStats } from "./statsFacade.js"; // re-exported below
import { upsertGroup } from "../services/groupService.js";
import { sleep } from "../utils/helpers.js";

/**
 * Compose enrollmentData from context (when a student fetches via group/private)
 * @param {import('telegraf').Context} ctx - The Telegraf context object.
 * @param {object} payload - The payload containing enrollment information.
 * @param {string} payload.enrollmentNo - The enrollment number.
 * @param {string} payload.gradeCardName - The grade card name.
 * @param {string} payload.programmeCode - The programme code.
 * @returns {object} An object containing enrollment data.
 */
export function buildEnrollmentFromCtx(ctx, payload) {
  const isPrivate = ctx.chat?.type === "private";
  return {
    enrollmentNo: payload.enrollmentNo,
    gradeCardName: payload.gradeCardName,
    programmeCode: payload.programmeCode,
    sourceGroup: isPrivate ? null : {
      groupId: String(ctx.chat.id),
      groupUsername: ctx.chat.username || null,
      groupLink: null, // fill if you maintain your own link registry
    }
  };
}

/** Handle a fetch action (called from your command/callback) 
 * @async
 * @param {import('telegraf').Context} ctx - The Telegraf context object.
 * @param {object} payload - The payload containing enrollment information.
 * @param {string} payload.enrollmentNo - The enrollment number.
 * @param {string} payload.gradeCardName - The grade card name.
 * @param {string} payload.programmeCode - The programme code.
 * @returns {Promise<void>}
 */
export async function insertUserData(ctx, payload) {
  const isPrivate = ctx.chat?.type === "private";
  const user = await upsertUser(
    {
      telegramId: String(ctx.from.id),
      telegramName: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
      telegramUsername: ctx.from.username || null,
      isPrivate,
    },
    buildEnrollmentFromCtx(ctx, payload),
    { command: "fetch", incrementFetch: true }
  );

  // Example reply
  let reply =await ctx.reply(
    `✅ Linked ENR ${payload.enrollmentNo}. You now have ${user.seenEnrollments.length} enrollment(s).`
  );

  sleep(5000).then(() => ctx.deleteMessage(reply.message_id).catch(console.log));

}

/** When the bot is added/removed/updated in a group 
 * @async
 * @param {import('telegraf').Context} ctx - The Telegraf context object.
 * @returns {Promise<void>}
 */
export async function insertGroupData(ctx) {
  const chat = ctx.chat;
  if (!chat) return;

  if (chat.type === "group" || chat.type === "supergroup") {
    const status = ctx.update.my_chat_member?.new_chat_member?.status;
    if (status === "member" || status === "administrator") {
      await upsertGroup({
        groupId: String(chat.id),
        groupTitle: chat.title,
        groupUsername: chat.username || null,
        groupLink: null
      });
      console.log(`✅ Bot added to group: ${chat.title} (${chat.id})`);
    } else if (status === "left" || status === "kicked") {
      // Optional: decide whether to delete the group doc or keep history
      console.log(`ℹ️ Bot removed from group: ${chat.title} (${chat.id})`);
    }
  }
}

/** Delete an enrollment for a user 
 * @async
 * @param {import('telegraf').Context} ctx - The Telegraf context object.
 * @param {string} enr - The enrollment number to delete.
 * @returns {Promise<void>}
 */
export async function handleDeleteEnrollment(ctx, enr) {
  await deleteEnrollment(String(ctx.from.id), enr);
  await ctx.reply(`🧹 Enrollment ${enr} removed.`);
}
