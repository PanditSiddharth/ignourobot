const axios = require('axios');
const cheerio = require('cheerio');

const programs = [
    [
        "BCA", "BCAOL", "MCA", "MCAOL", "MP", "MPB",
        "PGDCA", "PGDCA_NEW", "PGDHRM", "PGDFM", "PGDOM",
        "PGDMM", "PGDFMP", "MBF", "MCA_NEW"
    ],
    [
        "ASSO", "BA", "BCOM", "BDP", "BSC"
    ],
    [
        "BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH", "BAPSH",
        "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH", "BSCBCH", "BSCG",
        "BSWG", "BSWGOL"
    ],
];



/**
 * Retrieves student information and result based on the enrollment number and program.
 * 
 * @param {number | string} enrollmentNo - The enrollment number of the student.
 * @param {string} program - The program name the student is enrolled in.
 * @returns {Promise<{name: string, enrollmentNo: number, marks: {subject: string, assignmentMarks: string, examMarks: string, practicalMarks: string}[]}>} 
 * A promise that resolves to an object containing the student's name, enrollment number, and an array of results.
 */
export async function fetchGradeCard(enrollmentNo, program) {
    let ab = 1
    if (programs[0].includes(program)) {
        ab = 1
    }
    else if (programs[1].includes(program)) {
        ab = 2
    } else  if (programs[2].includes(program)) {
        ab = 4
    } else {
        ab = 3
    }
console.log(enrollmentNo, program, ab)
    const url = `https://gradecard.ignou.ac.in/gradecard/view_gradecard.aspx?eno=${enrollmentNo}&prog=${program}&type=${ab}`;
    const { data } = await axios.get(url);

    // Use Cheerio to parse HTML
    const $ = cheerio.load(data);
    let rows = $('#ctl00_ContentPlaceHolder1_gvDetail tr')
    let resdata = []
    for (let i = 1; i < rows.length - 1; i++) {
        let rowData = $(rows[i]).find("td")
        resdata.push({
            subject: $(rowData[0]).text(),
            assignmentMarks: $(rowData[1]).text(),
            examMarks: $(rowData[6]).text(),
            practicalMarks: $(rowData[7]).text()
        })
    }

    let name = $("#ctl00_ContentPlaceHolder1_lblDispname").text()

    return {
        name,
        enrollmentNo,
        marks: resdata
    };
}

