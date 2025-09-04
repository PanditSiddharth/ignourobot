export async function start(ctx) {
    await ctx.reply(`Hello ${ctx.from.first_name} 👋,

Help Menu:
/me - About your information
/help - List of commands
/marks <enrollmentno> <program> 
Get marks card
Example: /marks 123456789 BCA
Result:
/result <enrollmentno>
Example: /result 123456789

Assignment/practical status:
/sts <enrollmentno> <program>
Example: /sts 123456789 BCA`);
}