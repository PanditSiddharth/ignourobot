const programs = require("./programs")

const getEnrolmentAndCode = (msg = "") => {
    const ignouPrograms = programs.getAllPrograms();
    const programRegex = new RegExp(`\\b(${ignouPrograms.join("|")})\\b`, "i");

    return {
        enrollment: msg.match(/\d{8,10}/)?.[0]?.trim(),
        code: msg.match(programRegex)?.[0]?.toUpperCase()
    }
}

module.exports = { getEnrolmentAndCode }