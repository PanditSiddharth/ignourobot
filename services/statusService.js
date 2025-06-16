const axios = require('axios');
const cheerio = require('cheerio');

class StatusService {
    static async getStatus(enrollmentNo, program) {
        const status = await this.fetchStatusData(enrollmentNo, program);
        return this.formatStatusMessage(status);
    }

    static async fetchStatusData(enrollmentNo, program) {
        const url = 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP';
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'ASPSESSIONIDAQCQTCSD=NIOMCDMDNKEJCFLKLIFBCEHD',
                'Referer': 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.asp'
            }
        };

        const data = `EnrNo=${enrollmentNo}&program=${program}&Submit=Submit`;
        const response = await axios.post(url, data, config);
        return this.parseStatusHtml(response.data);
    }

    static parseStatusHtml(html) {
        const $ = cheerio.load(html);
        return {
            assignments: this.parseAssignments($),
            practicals: this.parsePracticals($)
        };
    }

    static formatStatusMessage({ assignments, practicals }) {
        let message = '';
        
        if (assignments.length > 0) {
            message += "Assignment Status:\\n```\nStatus  Date     Subject\n";
            assignments.forEach(a => {
                message += `${a.status}  ${a.date}  ${a.subject}\n`;
            });
            message += "```\n";
        }

        if (practicals.length > 0) {
            message += "\nPractical Status:\\n```\nStatus  Date     Subject\n";
            practicals.forEach(p => {
                message += `${p.status}  ${p.date}  ${p.subject}\n`;
            });
            message += "```";
        }

        return message || "No status updates found";
    }
}

module.exports = StatusService;
