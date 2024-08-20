import { fetchGradeCard } from "./fetchGradeCard"


let courses = {
    // BCA
    BCS011: { mm: 100, aw: 25 },
    BCS012: { mm: 100, aw: 25 },
    BCS031: { mm: 100, aw: 25 },
    BCS040: { mm: 50, aw: 25 },
    BCS041: { mm: 100, aw: 25 },
    BCS042: { mm: 50, aw: 25 },
    BCS051: { mm: 100, aw: 25 },
    BCS052: { mm: 100, aw: 25 },
    BCS053: { mm: 50, aw: 25 },
    BCS054: { mm: 100, aw: 25 },
    BCS055: { mm: 50, aw: 25 },
    BCS062: { mm: 50, aw: 25 },
    BCSL013: { mm: 50, aw: 25 },
    BCSL021: { mm: 50, aw: 25 },
    BCSL022: { mm: 50, aw: 25 },
    BCSL032: { mm: 50, aw: 25 },
    BCSL033: { mm: 50, aw: 25 },
    BCSL034: { mm: 50, aw: 25 },
    BCSL043: { mm: 50, aw: 25 },
    BCSL044: { mm: 50, aw: 25 },
    BCSL045: { mm: 50, aw: 25 },
    BCSL056: { mm: 50, aw: 25 },
    BCSL057: { mm: 50, aw: 25 },
    BCSL058: { mm: 50, aw: 25 },
    BCSL063: { mm: 50, aw: 25 },
    ECO01: { mm: 50, aw: 30 },
    ECO02: { mm: 50, aw: 30 },
    FEG02: { mm: 50, aw: 30 },
    MCS011: { mm: 100, aw: 25 },
    MCS012: { mm: 100, aw: 25 },
    MCS013: { mm: 50, aw: 25 },
    MCS014: { mm: 100, aw: 25 },
    MCS015: { mm: 50, aw: 25 },
    MCS021: { mm: 100, aw: 25 },
    MCS022: { mm: 100, aw: 25 },
    MCS023: { mm: 100, aw: 25 },
    MCS024: { mm: 100, aw: 25 },
    MCSL016: { mm: 100, aw: 25 },

    // MCA_NEW 
    MCS201: { mm: 100, aw: 30 },
    MCS208: { mm: 100, aw: 30 },
    MCS211: { mm: 100, aw: 30 },
    MCS212: { mm: 100, aw: 30 },
    MCS213: { mm: 100, aw: 30 },
    MCS214: { mm: 50, aw: 30 },
    MCS215: { mm: 50, aw: 30 },
    MCSL216: { mm: 50, aw: 30 },
    MCSL217: { mm: 50, aw: 30 },
    MCS218: { mm: 100, aw: 30 },
    MCS219: { mm: 100, aw: 30 },
    MCS220: { mm: 100, aw: 30 },
    MCS221: { mm: 100, aw: 30 },
    MCSL222: { mm: 50, aw: 30 },
    MCSL223: { mm: 50, aw: 30 },
    MCS224: { mm: 100, aw: 30 },
    MCS225: { mm: 100, aw: 30 },
    MCS226: { mm: 100, aw: 30 },
    MCS227: { mm: 100, aw: 30 },
    MCSL228: { mm: 50, aw: 30 },
    MCSL229: { mm: 50, aw: 30 },
    MCS230: { mm: 100, aw: 30 },
    MCS231: { mm: 100, aw: 30 },
    MCSP232: { mm: 200, aw: 30 }
};

export function getfm(am) {
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(am))
        return am + " "
    else if (isNaN(am) == true)
        return "0 "
    else return am
}

export function getfem(em, pm) {
    let am = em == "-" ? pm : em;
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(am))
        return am + " "
    else if (isNaN(am) == true)
        return "0 "
    else return am
}

export const getFormattedGrade = async (enrollment, program) => {
    let result = await fetchGradeCard(enrollment, program)

    if (result.marks.length < 1)
        return "Your selected program " + program + "'s I did'nt found grade card result"
    let gradeCard = `Your Grade Card: 

\`\`\`js
Asm   Exm  Pcnt   Sub   `
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


/**
 * 
 * @param {Number} am 
 * @param {Number} lm 
 * @param {Number} em 
 * @param {String} sub 
 * @param {String} prog 
 * @returns {got: Number, in: Number}
 */
function calcPercent(am, lm, em, sub, prog) {
    let res = { got: "0 ", in: " 0 " }
    if (!courses[sub])
        return res
    let subb = courses[sub]

    if(sub.replace(/\d*/, "")?.endsWith("P") && subb.mm >100){
        if(lm == "-")
            return {got: em, in: subb.mm}
        else {
            return {got: lm + em, in: subb.mm }
        }
    }
    if ([am, em].every(v => {
        if (!isNaN(v)) {
            if (v > 39)
                return true;
            else if (["BCA", "MCA", "BCA_NEW", "MCA_NEW", 'MCAOL', 'BCAOL'].includes(prog)) {
                if (v < 40)
                    return false
                else
                    return true
            } else if (v < 33)
                return false
            else
                return true
        } else
            return false
    })) {
        if (lm == "-")
            res.got = Math.round(am * subb.aw / 100) + Math.round(em * (100 - +subb.aw) / 100)
        else {
            res.got = Math.round(am * +subb.aw / 100) +
                Math.round((+em + +lm) / 2 * (100 - +subb.aw) / 100)
        }

        res.got = Math.round(res.got * subb.mm / 100)
        res.in = subb.mm == 50 ? "50 " : subb.mm;
        return res
    } else {
        return res
    }
}

export const getMarksCard = async (enrollment, program) => {
    let result = await fetchGradeCard(enrollment, program)

    if (result.marks.length < 1)
        return "Your selected program " + program.replace(/\_/, "\\_") + "'s I did'nt found grade card result"
    let gradeCard = `Your Marks Card: 

\`\`\`js
Asm   Exm  lbm   Pcnt        Sub   `
    let res = result.marks;
    let pctg = { got: 0, in: 0 }
    let div = 0

    for (let i = 0; i < res.length; i++) {
        let am = res[i].assignmentMarks;
        let pm = res[i].practicalMarks;
        let em = res[i].examMarks;
        let lm = res[i].labMarks;
        let sub = res[i].subject;
        let pcnt = calcPercent(am, lm, em == "-" ? pm : em, sub, program);
        pctg.got = +pctg.got + +pcnt.got;
        // console.log(pcnt.in)
        pctg.in = pctg.in + +pcnt.in;

        gradeCard += `\n${getfm(am)}    ${getfem(em, pm)}    ${getfm(lm)}   ${(pcnt.got == 0 ? "0 " : Math.round(pcnt.got)) + " in " + pcnt.in}   ${sub}`
    }
    gradeCard += "```"
    console.log(pctg)
    gradeCard += "\n\n>Result\\: " + "Got " + pctg.got + " in " + pctg.in
    gradeCard += "\n>Your Percentage\\: " + Math.round(+pctg.got / +pctg.in * 100) + " %"
    gradeCard += "\n>More details: [Click Here](https://telegra.ph/Details-of-that-grade-card-result-08-17)"

    return gradeCard;
}