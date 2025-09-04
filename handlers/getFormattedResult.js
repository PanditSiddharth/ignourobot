const fetchGradeCard = require("../api/fetchGradeCard");
const { getStatusData, formatDate } = require("../api/status");
let { courses } = require("../courses")

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

const getFormattedGrade = async (enrollment, program) => {
    let result = await fetchGradeCard(enrollment, program)

    if (result.marks.length < 1)
        return "Your selected program " + program + "'s I did'nt found grade card result"
    let gradeCard = `Your Grade Card: 

\`\`\`js
Asm     Exm  Pcnt   Sub   `
    let res = result.marks;
    let percentage = 0
    let div = 0


    for (let i = 0; i < res.length; i++) {
        let am = res[i].assignmentMarks
        let pm = res[i].practicalMarks
        let em = res[i].examMarks;

        let examMarks = isNaN(em) == true ? (isNaN(pm) ? "- " : pm) : res[i].examMarks;
        let percentag = "\\- "
        if (!isNaN(examMarks) && !isNaN(am) && examMarks >= 33) {
            if (program == "BCA") {
                percentag = examMarks * 3 / 4 + am * 1 / 4
            } else
                percentag = examMarks * 7 / 10 + am * 3 / 10

            percentage += percentag
            percentag = Math.round(percentag)
            div++
        }
        gradeCard += `\n${getfm(am)}    ${getfem(em, pm)}    ${percentag}    ${res[i].subject}`
    }
    gradeCard += "```"

    gradeCard += "\n\n>Your Approx Percentage\\: " + Math.round(percentage / div)
    gradeCard += "\n>More details: [Click Here](https://telegra.ph/Details-of-that-grade-card-result-08-17)"

    return gradeCard;
}


const calc = (am, em, sub) => {
    let res = { got: "0  ", in: "0  " }
    if (!courses[sub])
        return res;
    let subb = courses[sub]
    res.in = subb.mm == 50 ? "50 " : subb.mm; // formatted 50

    let realAm = Math.round(am * subb.aw / 100 * (subb.mm/100))
    let realEm = Math.round(em * (100 - +subb.aw) / 100 * (subb.mm/100))

    res.got = realAm + realEm
    return (isNaN(res.got) ? { got: "0  ", in: "0  " } : res)
    
}

function padRight(str, length) {
    return (str + " ".repeat(length)).substring(0, length);
}

const getMarksCard = async (enrollment, program) => {
    let result = await fetchGradeCard(enrollment, program)
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

module.exports = { getMarksCard, getFormattedGrade, statusHandler, getStatus }
