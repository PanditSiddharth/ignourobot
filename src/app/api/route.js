import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Telegraf } from 'telegraf';
import https from 'https';
import { fileHandle } from "./handleFile"
const { fetchGradeCard } = require("./fetchGradeCard")
import { formatDate, getStatusData } from "./status"
import { getFormattedGrade, getMarksCard } from "./helpers"

const agent = new https.Agent({
    rejectUnauthorized: false
});

const bot = new Telegraf(process.env.TOKEN, { handlerTimeout: 1000000 });
bot.use(async (ctx, next) => {
    if (!ctx.callbackQuery && !(ctx.message && ctx.message.text.startsWith("/")))
        return next()
    await ctx.telegram.sendMessage(process.env.TEST_CHAT, (ctx?.message?.text || ctx.callbackQuery.data) + "\nUser Id: " + ctx.from.id + "\nUsername: @" + ctx.from?.username)
    await next()
})
async function igres(data) {
    try {
        const dt = JSON.parse(data);
        const url = `https://termendresult.ignou.ac.in/TermEnd${dt.text}/TermEnd${dt.text}.asp`;

        const response = await axios.get(url, { httpsAgent: agent });
        let Cookie;

        if (response.headers['set-cookie']) {
            Cookie = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
        }

        const result = await axios.post(url, { eno: dt.eno, myhide: "OK" }, {
            headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie },
            httpsAgent: agent
        });

        const html = result.data;
        const $ = cheerio.load(html);
        let results = ["𝗬𝗼𝘂𝗿 𝗶𝗴𝗻𝗼𝘂 𝗥𝗲𝘀𝘂𝗹𝘁", "𝗦𝘂𝗯𝗷𝗲𝗰𝘁 ㅤㅤㅤㅤ𝗡𝘂𝗺𝗯𝗲𝗿𝘀"];

        $('table tr:not(:first-child)').each(function () {
            const tds = $(this).find('td');
            const courseCode = $(tds[0]).text().trim();
            const marks = $(tds[1]).text().trim();
            const maxMarks = $(tds[2]).text().trim();
            results.push(`${courseCode} ㅤㅤㅤㅤ${marks} in ${maxMarks}`);
        });

        return results.join('\n');
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching IGNOU result');
    }
}

async function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function del(ctx, message_id, delTime = 10) {
    try {
        await sleep(delTime);
        if (message_id) await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
    } catch (error) {
        console.error(error);
    }
}

async function send(ctx, message, options = {}) {
    try {
        return await ctx.reply(message, options);
    } catch (error) {
        console.error(error);
    }
}

bot.start((ctx) => {
    const { first_name } = ctx.from;
    ctx.reply(`Hello ${first_name}, enter /grade command with your roll no and program to get grade card.
For example: /grade 123456789 BCA

For result:
Write /isc command with your username
Example:
/isc 123456789

More /help
`);
});

bot.help(ctx => {
    ctx.reply(`
Send these command for 

Grade Card:
/grade <enrollmentno> <programcode>
Example: /grade 123456789 BCA

Result:
/isc <enrollmentno>
Example: /isc 123456789

Assignment/practical status:
/sts <enrollmentno> <program>
/sts 123456789 BCA
        `)
})

bot.command("sts", async (ctx, next) => {
    let text = ctx.message.text;
    if (text.trim() == "/sts")
        return ctx.reply("To check your assignment/practical status send this command\n" +
            "/sts <enrollmentno> <program>\n" +
            "/sts 123456789 BCA")

    const enr = text.match(/\d+/);
    ctx.deleteMessage().catch(console.log)
    let program = ""
    program = text.replace(/\/sts/i, "")?.replace(/\d+/, "")?.trim()?.toLocaleUpperCase()

    if (!program) {
        return send(ctx, "Plase enter your program name also")
    }
    if (!enr || enr[0].length < 9) {
        return await send(ctx, "Invalid enrollment number: \n" + "To check your assignment/practical status send this command\n" +
            "/sts <enrollmentno> <program>\n" +
            "/sts 123456789 BCA");
    }

    let res = await getStatusData(enr[0], program)

    let pt = res.practical;
    let asm = res.assignment;

    if (pt.length < 1 && asm.length < 1) {
        return ctx.reply("I din't found any status update for program.")
    }

    let status = asm.length > 0 ? "Your Assignment status\\: \n```js\nStatus  Updtd On  Subject" : ""

    for (let i = 0; i < asm.length; i++) {
        status += `\n${asm[i].status.includes("Check Grade") ? '✅   ' : "☑️   "}  ${formatDate(asm[i].date)}  ${asm[i].subject} `
    }
    status += asm.length > 0 ? "```" : "";


    status += pt.length > 0 ? "Your Practicals status\\: \n```js\nStatus  Updtd On  Subject" : ""

    for (let i = 0; i < pt.length; i++) {
        status += `\n${pt[i].status.includes("Check Grade") ? '✅   ' : "☑️   "}  ${formatDate(pt[i].date)}  ${pt[i].subject} `
    }
    status += pt.length > 0 ? "```" : "";
    status += "\n\n>✅ \\= Done\\,    ☑️ \\= In\\-Progress";

    await ctx.reply(status, { parse_mode: "MarkdownV2" });

})

bot.command("marks", async ctx => {
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
        if(!['BCA', 'MCA_NEW', "MCA", "MCAOL"].includes(program)){
            return ctx.reply("This feature is only for BCA MCA students it will slowly slowly available for all.")
        }

        let gradeCard = await getMarksCard(enr[0], program)
        console.log(gradeCard)
        return ctx.reply(gradeCard.replace(/\s\-\s/, '\\-'), {
            parse_mode: "MarkdownV2", link_preview_options: {
                is_disabled: true
            }
        })
            .catch(err => console.log(err.message))

    } catch (error) {
        ctx.reply(error.message)
    }
})

bot.command("grade", async ctx => {
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
})

bot.action(/grade.+/i, async (ctx, next) => {
    const text = ctx.callbackQuery.data;
    console.log("yes it's working")
    if (!text.includes("grade_"))
        return next()

    ctx.deleteMessage()
    let pdata = text.split("_")
    let gradeCard = await getFormattedGrade(pdata[1], pdata[2])
    ctx.reply(gradeCard, { parse_mode: "MarkdownV2" })
        .catch(err => console.log(err.message))
})

bot.on("message", (ctx, next) => fileHandle(ctx, next, bot))

bot.on("message", async (ctx, next) => {
    try {
        const { message } = ctx;
        if ((message.text + "").startsWith("/isc")) {
            await ctx.deleteMessage(message.message_id).catch(() => { });
            // console.log(message)
            const enr = message.text.match(/\d+/);
            // return console.log(enr)
            if (!enr || enr[0].length < 9) {
                await send(ctx, "Invalid enrollment number: \nAfter writing /isc write your enrollment number ");
                return;
            }

            const replyMarkup = {
                inline_keyboard: [
                    [
                        { text: "June 24", callback_data: JSON.stringify({ "eno": enr[0], "text": "June24" }) },
                        { text: "Dec 23", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec23" }) },
                        { text: "June 23", callback_data: JSON.stringify({ "eno": enr[0], "text": "June23" }) },
                        { text: "Dec 22", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec22" }) },
                    ],
                    [
                        { text: "June 22", callback_data: JSON.stringify({ "eno": enr[0], "text": "June22" }) },
                        { text: "Dec 21", callback_data: JSON.stringify({ "eno": enr[0], "text": "Dec21" }) },
                        { text: "June 21", callback_data: JSON.stringify({ "eno": enr[0], "text": "June21" }) },
                        { text: "Close", callback_data: "close" }]
                ],
            };
            await ctx.reply("For which result you want to see ?", { reply_markup: replyMarkup });
        }
        // await next();
    } catch (error) {
        console.error("message", error);
    }
});

bot.on("callback_query", async (ctx, next) => {
    try {
        const { callback_query } = ctx.update;
        if (!callback_query.data.includes('eno') || !callback_query.data.includes('text')) return next();
        await ctx.answerCbQuery();
        await ctx.deleteMessage().catch((er) => { console.error(er) });
        if (callback_query.data == "close") return;
        const res = await igres(callback_query.data);
        if (res) {
            if (res.match(/\d/)) return await ctx.reply(res);
            send(ctx, "Your result is not available for " + JSON.parse(callback_query.data).text + " Session", { time: 80 });
        } else {
            send(ctx, "Some error with this enrollment or in the date you selected", { time: 20 });
        }
    } catch (error) {
        console.error("query", error);
    }
});

export async function GET(req) {
    try {
        if (process.env.NODE_ENV == "development") {
            await bot.launch({ dropPendingUpdates: true })
        }
        return NextResponse.json({ "done": true });
    } catch (err) {
        console.error(err.message)
        return NextResponse.json({ error: "Invalid" })
    }
}


export async function POST(req) {
    try {
        if (process.env.NODE_ENV == "production")
            await bot.handleUpdate(await req.json());
        return NextResponse.json({ "done": true });
    } catch (err) {
        return NextResponse.json({ error: "Invalid" })
    }
}
