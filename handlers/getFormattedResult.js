import { getStatusData, formatDate } from "../api/status.js";
import {courses} from "../courses.js";

function getfm(am) {
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(am))
        return (am + "  ").substring(0, 3)
    else if (isNaN(am) == true)
        return "0  "
    else return (am + "  ").substring(0, 3)
}

function getfem(em, pm) {
    let am = em == "-" ? pm : em;
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(am))
        return (am + "  ").substring(0, 3)
    else if (isNaN(am) == true)
        return "0  "
    else return (am + "  ").substring(0, 3)
}


const calc = (am, em, sub) => {
    let res = { got: "0  ", in: "0  " }
   
    let subb = courses[sub] ? courses[sub] : { aw: 30, mm: 100 }
    
    res.in = subb.mm == 50 ? "50 " : subb.mm; // formatted 50

    let realAm = Math.round(am * subb.aw / 100 * (subb.mm/100))
    let realEm = Math.round(em * (100 - +subb.aw) / 100 * (subb.mm/100))

    res.got = realAm + realEm
    return (isNaN(res.got) ? { got: "0  ", in: "0  " } : res)
    
}

function padRight(str, length) {
    return (str + " ".repeat(length)).substring(0, length);
}

const getMarksCard = async (result) => {

    result.marks = result.marks.map(res => {
        let calcc = calc(res.assignmentMarks == "-" ? res.labMarks : res.assignmentMarks,
             res.examMarks == "-" ? res.practicalMarks : res.examMarks, res.subject)
        return {...res, ...calcc}
    })

    if (result.marks.length < 1)
        return "Your selected program " + program.replace(/\_/, "\\_") + "'s I did'nt found grade card result"
    let gradeCard = `Your Marks Card: 

\`\`\`js
Asm  Exm  Lbm  Marks       Sub   `
    let res = result.marks;
    let total = { got: 0, in: 0 }

    for (let i of result.marks) {
        total.got += +i.got;
        total.in += +i.in;
        let marksStr = (i.got == 0 ? "0" : Math.round(i.got)) + " in " + i.in;
        gradeCard += `\n${padRight(getfm(i.assignmentMarks), 5)}${padRight(getfem(i.examMarks, i.practicalMarks), 5)}${padRight(getfm(i.labMarks), 5)}${padRight(marksStr, 12)} ${i.subject}`
    }
    gradeCard += "```"
    console.log(total)
    gradeCard += "\n\n>Result\\: " + "Got " + total.got + " in " + total.in
    gradeCard += "\n>Your Percentage\\: " + (Math.round((+total.got / +total.in * 100) * 100) / 100).toString().replace(".", "\\.") + " %"
    gradeCard += "\n>More details: [Click Here](https://telegra.ph/Details-of-that-grade-card-result-08-17)"

    return gradeCard;
}

const statusHandler = async (ctx, next) => {
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
        return ctx.reply("Plase enter your program name also")
    }
    if (!enr || enr[0].length < 9) {
        return await ctx.reply("Invalid enrollment number: \n" + "To check your assignment/practical status send this command\n" +
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

}

const getStatus = async (enr, code) => {
   
    let program = code

    let res = await getStatusData(enr[0], program)

    let pt = res.practical;
    let asm = res.assignment;

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

    return status

}


// bot.on("callback_query", async (ctx, next) => {
//     try {
//         const { callback_query } = ctx.update;
//         if (!callback_query.data.includes('eno') || !callback_query.data.includes('text')) return next();
//         await ctx.answerCbQuery();
//         await ctx.deleteMessage().catch((er) => { console.error(er) });
//         if (callback_query.data == "close") return;
//         const res = await igres(callback_query.data);
//         if (res) {
//             if (res.match(/\d/)) return await ctx.reply(res);
//             send(ctx, "Your result is not available for " + JSON.parse(callback_query.data).text + " Session", { time: 80 });
//         } else {
//             send(ctx, "Some error with this enrollment or in the date you selected", { time: 20 });
//         }
//     } catch (error) {
//         console.error("query", error);
//     }
// });



export { getMarksCard, statusHandler, getStatus }
