const { fetchGradeCard } = require('../utils/fetchGradeCard');

class GradeCardService {
    static async getFormattedGradeCard(enrollmentNo, program) {
        const result = await fetchGradeCard(enrollmentNo, program);
        
        if (result.marks.length < 1) {
            return `Your selected program ${program}'s grade card result was not found`;
        }

        let gradeCard = this.#formatGradeCardHeader();
        const { percentage, div } = await this.#calculateGrades(result.marks);
        gradeCard += this.#formatMarksTable(result.marks);
        gradeCard += this.#formatGradeCardFooter(percentage, div);

        return gradeCard;
    }

    static #formatGradeCardHeader() {
        return `Your Grade Card: \n\n\`\`\`js\nAsm   Exm  Pcnt   Sub   `;
    }

    static #calculateGrades(marks) {
        let percentage = 0;
        let div = 0;
        // ...existing grade calculation logic...
        return { percentage, div };
    }

    static #formatMarksTable(marks) {
        // ...existing marks table formatting logic...
    }

    static #formatGradeCardFooter(percentage, div) {
        return "\n\n>Your Approx Percentage\\: " + Math.round(percentage / div) +
               "\n>More details: [Click Here](https://telegra.ph/Details-of-that-grade-card-result-08-17)";
    }
}

module.exports = GradeCardService;
