const axios = require('axios');
const cheerio = require('cheerio');
const programs = require('../utils/programs');

/**
 * Retrieves student information and result based on the enrollment number and program.
 * 
 * @param {number | string} enrollmentNo - The enrollment number of the student.
 * @param {string} program - The program name the student is enrolled in.
 * @returns {Promise<{name: string, enrollmentNo: number, marks: {subject: string, assignmentMarks: string, examMarks: string, practicalMarks: string, labMarks: string}[]}>} 
 * A promise that resolves to an object containing the student's name, enrollment number, and an array of results.
 */
async function fetchGradeCard(enrollmentNo, program) {
    const programType = programs.getTypeForProgram(program);
    
    const url = `https://gradecard.ignou.ac.in/gradecard/view_gradecard.aspx?eno=${enrollmentNo}&prog=${program}&type=${programType}`;
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
            labMarks: $(rowData[2]).text(),
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

module.exports = fetchGradeCard;