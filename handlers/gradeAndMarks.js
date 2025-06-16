const { Context } = require("telegraf")
const { getFormattedGrade, getMarksCard } = require("./getFormattedResult")
const { getEnrolmentAndCode } = require("../utils/helpers")

/**
 * 
 * @param {Context<{message: Update.New & Update.NonChannel & Message.TextMessage; update_id: number;}>} ctx 
 * @param {*} next 
 */
const getGrade = async ctx => {
    try {

        const text = ctx.message.text
        const enr = text.match(/\d+/);
        ctx.deleteMessage().catch(console.log)
        let program = ""

        if (text?.toLowerCase()?.trim() == "/grade") {
            return ctx.reply(`Send like this formate: 
/grade <enrollmentno> <programcode>
/grade 123456789 BCA`)
        }

        program = text.replace(/\/grade/i, "")?.replace(/\d+/, "")?.trim()?.toLocaleUpperCase()
        console.log(program)
        // return console.log(enr)
        if (!enr || enr[0].length < 9) {
            await send(ctx, "Invalid enrollment number: \nWrite your enrollment number with command grade for example:\n/grade 123456789");
            return;
        }

        if (program) {
            let gradeCard = await getFormattedGrade(enr[0], program)
            return ctx.reply(gradeCard, {
                parse_mode: "MarkdownV2", link_preview_options: {
                    is_disabled: true
                }
            })
                .catch(err => console.log(err.message))
        }

        const programs = [
            "BCA", "BCAOL", "MCA", "MCAOL", "MP", "MPB", "PGDCA", "PGDCA_NEW",
            "PGDHRM", "PGDFM", "PGDOM", "PGDMM", "PGDFMP", "MBF", "MCA_NEW",
            "BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH",
            "BAPSH", "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH",
            "BSCBCH", "BSCG", "BSWG", "BSWGOL", "ASSO", "BA", "BCOM",
            "BDP", "BSC"
        ];

        const replyMarkup = {
            inline_keyboard: []
        };

        for (let i = 0; i < programs.length; i += 5) {
            const row = programs.slice(i, i + 5).map(program => ({
                text: program,
                callback_data: `grade_${enr[0]}_${program}`
            }));
            replyMarkup.inline_keyboard.push(row);
        }

        await ctx.reply("Select Your program", { reply_markup: replyMarkup });
    } catch (error) {
        ctx.reply(error.message)
    }
}

/**
 * 
 * @param {Context<{message: Update.New & Update.NonChannel & Message.TextMessage; update_id: number;}>} ctx 
 * @param {*} next 
 */
const getMarks = async (ctx, next) => {
    try {
        const text = ctx.message.text
        const enr = text.match(/\d+/);
        ctx.deleteMessage().catch(console.log)
        let program = ""

        if (text?.toLowerCase()?.trim() == "/marks") {
            return ctx.reply(`Send like this formate: 
    /marks <enrollmentno> <programcode>
    /marks 123456789 BCA`)
        }


        program = text.replace(/\/marks/i, "")?.replace(/\d+/, "")?.trim()?.toLocaleUpperCase()
        // return console.log(enr)
        if (!enr || enr[0].length < 9) {
            await send(ctx, "Invalid enrollment number: \nWrite your enrollment number with command marks for example:\n/marks 123456789 bca");
            return;
        }

        program = program == 'MCA' ? "MCA_NEW" : program
        if (!['BCA', 'MCA_NEW', "MCA", "MCAOL", 'BCAOL'].includes(program)) {
            return ctx.reply("This feature is only for BCA MCA students it will slowly slowly available for all.")
        }

        let gradeCard = await getMarksCard(enr[0], program)

        return ctx.reply(gradeCard.replace(/\s\-\s/, '\\-'), {
            parse_mode: "MarkdownV2", link_preview_options: {
                is_disabled: true
            }
        })
            .catch(err => console.log(err.message))

    } catch (error) {
        ctx.reply(error.message)
    }
}

const inlineGrade = async (ctx, next) => {
        const text = ctx.callbackQuery.data;
        console.log("yes it's working")
        if (!text.includes("grade_"))
            return next()
    
        ctx.deleteMessage()
        let pdata = text.split("_")
        let gradeCard = await getFormattedGrade(pdata[1], pdata[2])
        ctx.reply(gradeCard, { parse_mode: "MarkdownV2" })
            .catch(err => console.log(err.message))
    }

module.exports = { getGrade, getMarks, inlineGrade }