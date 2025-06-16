const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

class ResultService {
    static #agent = new https.Agent({ rejectUnauthorized: false });

    static async fetchResult(data) {
        const { eno, text } = JSON.parse(data);
        const url = `https://termendresult.ignou.ac.in/TermEnd${text}/TermEnd${text}.asp`;
        
        try {
            const cookie = await this.#getCookie(url);
            const result = await this.#fetchResultData(url, eno, cookie); // Fetch result data using private method
            return this.#parseResult(result.data);
        } catch (error) {
            console.error('Error fetching IGNOU result:', error);
            throw new Error('Failed to fetch result');
        }
    }

    static async #getCookie(url) {
        const response = await axios.get(url, { httpsAgent: this.#agent });
        if (!response.headers['set-cookie']) return '';
        return response.headers['set-cookie']
            .map(cookie => cookie.split(';')[0])
            .join(';');
    }

    static async #fetchResultData(url, eno, cookie) {
        const response = await axios.post(
            url,
            `eno=${eno}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                },
                httpsAgent: this.#agent
            }
        );
        return response;
    }

    static #parseResult(html) {
        const $ = cheerio.load(html);
        let results = ["𝗬𝗼𝘂𝗿 𝗶𝗴𝗻𝗼𝘂 𝗥𝗲𝘀𝘂𝗹𝘁", "𝗦𝘂𝗯𝗷𝗲𝗰𝘁 ㅤㅤㅤㅤ𝗡𝘂𝗺𝗯𝗲𝗿𝘀"];
        
        // ...existing result parsing logic...
        
        return results.join('\n');
    }
}

module.exports = ResultService;
