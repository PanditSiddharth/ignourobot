const axios = require('axios');
const cheerio = require('cheerio');

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
    if(program == "BAG" || program == "BSCG")
        ab = 4

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

