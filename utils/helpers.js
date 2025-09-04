import programs from "./programs.js";
let getAllPrograms = programs.getAllPrograms
const getEnrolmentAndCode = (msg = "") => {
  const ignouPrograms = getAllPrograms();
  const programRegex = new RegExp(`\\b(${ignouPrograms.join("|")})\\b`, "i");

  return {
    enrollment: msg.match(/\d{8,10}/)?.[0]?.trim(),
    code: msg.match(programRegex)?.[0]?.toUpperCase(),
  };
};

const sleep = (ms = 3000) => new Promise(res=>setTimeout(res, ms));

export { getEnrolmentAndCode, sleep };
