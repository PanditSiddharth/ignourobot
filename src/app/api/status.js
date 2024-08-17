const cheerio = require("cheerio")
const axios = require('axios');

const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'ASPSESSIONIDAQCQTCSD=NIOMCDMDNKEJCFLKLIFBCEHD',
        'Referer': 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.asp',
    }
};

/**
 * 
 * @param {Number} enrollmentNo 
 * @param {String} program 
 * @returns {Promise<{ assignment: {subject: string, status: string, date: string}[], 
 * practical: {subject: string, status: string, date: string}[] }>}
 */
async function getStatusData(enrollmentNo, program) {
    try {
        console.log(enrollmentNo, program)
        const data = `EnrNo=${enrollmentNo}&program=${program}&Submit=Submit`;
        let response = await axios.post('https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP', data, config)
        let htmld = response.data;
        const $ = cheerio.load(htmld)
        let res = {
            assignment: [],
            practical: []
        }
        let rows = $(".bkctable tbody tr")

        for (let i = 3; i < rows.length; i++) {
           let rowData = $(rows[i]).find("td")

           if($(rowData[0]).text() == "Assignment"){
            res.assignment.push({
                subject: $(rowData[1]).text(),
                status: $(rowData[3]).text(),
                date: $(rowData[4]).text()
            })
           } else {
            res.practical.push({
                subject: $(rowData[1]).text(),
                status: $(rowData[3]).text(),
                date: $(rowData[4]).text()
            })
           }
        }
    
        console.log(res)
        return res;
    } catch (error) {
        console.error('Error:', error);
        return { assignment: [], practical: []}
    }
}

function formatDate(dateStr) {
    const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04',
        May: '05', Jun: '06', Jul: '07', Aug: '08',
        Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    // Split the input date string into day, month, and year
    const [day, month, year] = dateStr.split('-');

    // Format the day to always be two digits
    const formattedDay = day.padStart(2, '0');

    // Convert the year to the last two digits
    const formattedYear = year.slice(-2);

    // Convert the month abbreviation to its numeric equivalent
    const formattedMonth = months[month];

    // Combine the formatted parts into the final string
    return `${formattedDay}-${formattedMonth}-${formattedYear}`;
}

export { getStatusData, formatDate }