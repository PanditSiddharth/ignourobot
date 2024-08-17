import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Telegraf } from 'telegraf';
import https from 'https';
import { fileHandle } from "./handleFile"
const { fetchGradeCard } = require("./fetchGradeCard")
const agent = new https.Agent({
    rejectUnauthorized: false
});

const bot = new Telegraf(process.env.TOKEN, { handlerTimeout: 1000000 });
bot.use(async (ctx, next)=> {
    if(!ctx.callbackQuery && !(ctx.message && ctx.message.text.startsWith("/")) )
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
    ctx.reply(`Hello ${first_name}, enter /grade command with your roll no to get grade card. 
    For example: /grade 123456789`);
});

const getFormattedGrade = async (enrollment, program) => {
    let result = await fetchGradeCard(enrollment, program)

    if(result.marks.length < 1)
        return "Your selected program " + program + "'s I did'nt found grade card result"
    let gradeCard = `Your Grade Card: 

\`\`\`js
Asm  Exm  Pcnt  Sub   `
    let res = result.marks;
    let percentage = 0
    let div = 0
    for (let i = 0; i < res.length; i++) {
        let examMarks = isNaN(res[i].examMarks) == true ? (isNaN(res[i].practicalMarks) ? "- " : res[i].practicalMarks) : res[i].examMarks;
        let percentag = "\\- "
        if(!isNaN(examMarks) && !isNaN(res[i].assignmentMarks) ){
            percentag = examMarks * 7/10 + res[i].assignmentMarks * 3/10
            percentage += percentag
            percentag = Math.round(percentag)
            div++
        }
        gradeCard += `\n${res[i].assignmentMarks}   ${examMarks}   ${percentag}   ${res[i].subject}`
    }
gradeCard += "```"

    gradeCard += "\n\n>Your Approx Percentage\\: " + Math.round(percentage/div)
     gradeCard += "\n**>Subject \\= Sub\n**>Assignment Marks \\= Asm\n**>Exam Marks \\= Exm \n**>Percentage \\= Pcnt\n\n>⚠ Note\\: Here Percent calculation is approximation not exact\\. We Used 30% weightage on assignment marks and 70% on exam marks\\.\n>It can be vary depend on subjects\\.\n**>We did'nt included incomplete subjects\\."

     return gradeCard;
}

bot.command("grade", async ctx => {
    try {
        
    const text = ctx.message.text
    const enr = text.match(/\d+/);
    let program = ""
    program = text.replace(/\/grade/i, "")?.replace(/\d+/, "")?.trim()?.toLocaleUpperCase()
    console.log(program)
    // return console.log(enr)
    if (!enr || enr[0].length < 9) {
        await send(ctx, "Invalid enrollment number: \nWrite your enrollment number with command grade for example:\n/grade 123456789");
        return;
    }

    if(program){
        let gradeCard = await getFormattedGrade(enr[0], program)
        return ctx.reply(gradeCard, {parse_mode: "MarkdownV2"})
        .catch(err=> console.log(err.message))
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

bot.on("callback_query", async (ctx, next) => {
    const text = ctx.callbackQuery.data;
    if (!text.includes("grade_"))
        return next()

    ctx.deleteMessage()
    let pdata = text.split("_")
   let gradeCard = await getFormattedGrade(pdata[1], pdata[2])
    ctx.reply(gradeCard, {parse_mode: "MarkdownV2"})
    .catch(err=> console.log(err.message))
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