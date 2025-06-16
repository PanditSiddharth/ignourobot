// const GradeCardService = require('../services/gradeCardService');
// const ResultService = require('../services/resultService');
const { fileHandle } = require('./handleFile');
const StatusService = require('../services/statusService');
const axios = require('axios');
const https = require('https');
const programs = require('../utils/programs');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function igres(data) {
    try {
        const dt = JSON.parse(data);
        const url = `https://termendresult.ignou.ac.in/TermEnd${dt.text}/TermEnd${dt.text}.asp`;
        // ...existing igres function code...
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching IGNOU result');
    }
}

function setupBot(bot) {
    bot.use(async (ctx, next) => {
        if (!ctx.callbackQuery && !(ctx.message && ctx.message.text.startsWith("/")))
            return next();
        await ctx.telegram.sendMessage(process.env.TEST_CHAT, 
            (ctx?.message?.text || ctx.callbackQuery.data) + 
            "\nUser Id: " + ctx.from.id + 
            "\nUsername: @" + ctx.from?.username);
        await next();
    });

    setupCommands(bot);
    setupCallbacks(bot);
    setupMessageHandlers(bot);
}

function setupCommands(bot) {
    bot.command('start', handleStart);
    bot.command('help', handleHelp);
    bot.command('grade', handleGrade);
    bot.command('marks', handleMarks);
    bot.command('sts', handleStatus);
}

function setupCallbacks(bot) {
    bot.action(/grade.+/i, handleGradeCallback);
    // ...other callback handlers...
}

function setupMessageHandlers(bot) {
    bot.on('message', (ctx, next) => fileHandle(ctx, next, bot));
    bot.on('message', handleIscCommand);
}

// Command handlers
// async function handleGrade(ctx) {
//     const { enrollmentNo, program } = parseGradeCommand(ctx.message.text);
//     if (!isValidEnrollment(enrollmentNo)) {
//         return ctx.reply('Invalid enrollment number format');
//     }
    
//     try {
//         const gradeCard = await GradeCardService.getFormattedGradeCard(enrollmentNo, program);
//         await ctx.reply(gradeCard, { parse_mode: 'MarkdownV2' });
//     } catch (error) {
//         await ctx.reply('Failed to fetch grade card');
//     }
// }

async function handleStart(ctx) {
    const { first_name } = ctx.from;
    await ctx.reply(
        `Hello ${first_name}, enter /grade command with your roll no and program to get grade card.
For example: /grade 123456789 BCA

For result:
Write /isc command with your username
Example: /isc 123456789

More /help`
    );
}

async function handleHelp(ctx) {
    await ctx.reply(`
Send these commands for:

Grade Card:
/grade <enrollmentno> <programcode>
Example: /grade 123456789 BCA

Result:
/isc <enrollmentno>
Example: /isc 123456789

Assignment/practical status:
/sts <enrollmentno> <program>
Example: /sts 123456789 BCA`);
}

async function handleStatus(ctx) {
    const { enrollmentNo, program } = parseCommand(ctx.message.text);
    if (!isValidCommand(enrollmentNo, program)) {
        return ctx.reply("Please use correct format: /sts <enrollmentno> <program>");
    }

    try {
        const status = await StatusService.getStatus(enrollmentNo, program);
        await ctx.reply(status, { parse_mode: "MarkdownV2" });
    } catch (error) {
        await ctx.reply("Failed to fetch status");
    }
}

async function handleGradeCallback(ctx) {
    const [_, enrollmentNo, program] = ctx.callbackQuery.data.split('_');
    await ctx.deleteMessage();
    
    try {
        const gradeCard = await GradeCardService.getFormattedGradeCard(enrollmentNo, program);
        await ctx.reply(gradeCard, { parse_mode: "MarkdownV2" });
    } catch (error) {
        await ctx.reply("Failed to fetch grade card");
    }
}

async function handleIscCommand(ctx) {
    const enrollmentNo = parseEnrollmentNumber(ctx.message.text);
    if (!enrollmentNo) {
        return ctx.reply("Invalid enrollment number format");
    }

    const sessionButtons = createSessionButtons(enrollmentNo);
    await ctx.reply("Select session for result:", { reply_markup: sessionButtons });
}

async function handleGrade(ctx) {
    try {
        const text = ctx.message.text;
        const enr = text.match(/\d+/);
        ctx.deleteMessage().catch(console.log);

        if (text?.toLowerCase()?.trim() == "/grade") {
            return ctx.reply(`Send like this format: 
/grade <enrollmentno> <programcode>
/grade 123456789 BCA`);
        }

        const allPrograms = programs.getAllPrograms();
        const replyMarkup = {
            inline_keyboard: []
        };

        for (let i = 0; i < allPrograms.length; i += 5) {
            const row = allPrograms.slice(i, i + 5).map(program => ({
                text: program,
                callback_data: `grade_${enr[0]}_${program}`
            }));
            replyMarkup.inline_keyboard.push(row);
        }

        await ctx.reply("Select Your program", { reply_markup: replyMarkup });
    } catch (error) {
        ctx.reply(error.message);
    }
}

// Helper functions
function parseCommand(text) {
    const parts = text.split(' ').filter(Boolean);
    return {
        enrollmentNo: parts[1],
        program: parts[2]?.toUpperCase()
    };
}

function isValidCommand(enrollmentNo, program) {
    return enrollmentNo?.length === 9 && program?.length > 1;
}

function createSessionButtons(enrollmentNo) {
    return {
        inline_keyboard: [
            [
                { text: "June 24", callback_data: JSON.stringify({ eno: enrollmentNo, text: "June24" }) },
                { text: "Dec 23", callback_data: JSON.stringify({ eno: enrollmentNo, text: "Dec23" }) }
            ],
            [
                { text: "June 23", callback_data: JSON.stringify({ eno: enrollmentNo, text: "June23" }) },
                { text: "Dec 22", callback_data: JSON.stringify({ eno: enrollmentNo, text: "Dec22" }) }
            ],
            [{ text: "Close", callback_data: "close" }]
        ]
    };
}

function parseEnrollmentNumber(text) {
    const match = text.match(/\d+/);
    if (!match || match[0].length !== 9) {
        return null;
    }
    return match[0];
}

module.exports = { igres, setupBot };
