import { Context } from "telegraf";
import { getMarksCard } from "./getFormattedResult.js";
import fetchGradeCard from "../api/fetchGradeCard.js";

/**
 *
 * @param {Context<{message: Update.New & Update.NonChannel & Message.TextMessage; update_id: number;}>} ctx
 * @param {*} next
 */
const getMarks = async (ctx, next, callback) => {
  try {
    const text = ctx.message.text;
    const enr = text.match(/\d+/);
    ctx.deleteMessage().catch(console.log);
    let program = "";

    if (text?.toLowerCase()?.trim() == "/marks") {
      return ctx.reply(`Send like this formate: 
    /marks <enrollmentno> <programcode>
    /marks 123456789 BCA`);
    }

    program = text
      .replace(/\/marks/i, "")
      ?.replace(/\d+/, "")
      ?.trim()
      ?.toLocaleUpperCase();
    // return console.log(enr)
    if (!enr || enr[0].length < 9) {
      await send(
        ctx,
        "Invalid enrollment number: \nWrite your enrollment number with command marks for example:\n/marks 123456789 bca"
      );
      return;
    }

    program = program == "MCA" ? "MCA_NEW" : program;
    // if (
    //   !["BCA", "MCA_NEW", "MCA", "MCAOL", "BCAOL", "BSCBCH"].includes(program)
    // ) {
    //   return ctx.reply(
    //     "This feature is only for BCA MCA and BSCBCH students it will slowly slowly available for all."
    //   );
    // }
    let result = await fetchGradeCard(enr[0], program);
    callback(ctx, { enrollmentNo: enr[0], programmeCode: program,
 gradeCardName: result.name });
    let gradeCard = await getMarksCard(result);

    return ctx
      .reply(gradeCard.replace(/\s\-\s/, "\\-"), {
        parse_mode: "MarkdownV2",
        link_preview_options: {
          is_disabled: true,
        },
      })
      .catch((err) => console.log(err.message));
  } catch (error) {
    ctx.reply(error.message);
  }
};


export const getSeasonButtons = async (ctx, next) => {
    try {
        const { message } = ctx;
        if ((message.text + "").startsWith("/result")) {
            await ctx.deleteMessage(message.message_id).catch(() => { });
            // console.log(message)
            const enr = message.text.match(/\d+/);
            // return console.log(enr)
            if (!enr || enr[0].length < 9) {
                await ctx.reply("Invalid enrollment number: \nAfter writing /result write your enrollment number ");
                sleep(3000).then(() => {
                    ctx.deleteMessage().catch(() => { });
                }
                );
                return;
            }

            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: "June 25", callback_data: JSON.stringify({ "eno": enr[0], "text": "June25" }) },
                  { text: "Dec 24", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec24" }) },
                  { text: "June 24", callback_data: JSON.stringify({ "eno": enr[0], "text": "June24" }) },
                  { text: "Dec 23", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec23" }) },
                ],
                [
                  { text: "June 23", callback_data: JSON.stringify({ "eno": enr[0], "text": "June23" }) },
                  { text: "Dec 22", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec22" }) },
                  { text: "June 22", callback_data: JSON.stringify({ "eno": enr[0], "text": "June22" }) },
                  { text: "Close", callback_data: "close" }]
              ],
            };
            await ctx.reply("For which result you want to see ?", { reply_markup: replyMarkup });
        }
        // await next();
    } catch (error) {
        console.error("message", error);
    }
};

export { getMarks };
