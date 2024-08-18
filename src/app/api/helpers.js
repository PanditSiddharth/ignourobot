import { fetchGradeCard } from "./fetchGradeCard"
export function getfm(am) {
    if(['A', 'B', 'C', 'D', 'E', 'F'].includes(am))
        return am + " "
    else if(isNaN(am) == true)
        return "- "
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
        gradeCard += `\n${getfm(am)}    ${getfm(em)}    ${percentag}    ${res[i].subject}`
    }
    gradeCard += "```"

    gradeCard += "\n\n>Your Approx Percentage\\: " + Math.round(percentage / div)
    gradeCard += "\n>More details: [Click Here](https://telegra.ph/Details-of-that-grade-card-result-08-17)"

    return gradeCard;
}