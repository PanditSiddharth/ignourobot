import * as cheerio from 'cheerio';
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false
});

export async function fetchResult(data) {
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
        if(error.response && error.response.status === 404) {
            return 'Result not declared yet';
        }
        return error.message || 'Error fetching IGNOU result';
        // throw new Error('Error fetching IGNOU result');
    }
}