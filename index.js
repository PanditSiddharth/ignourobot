const runBot = require("./main/bot");
const runServer = require("./main/server");
const bot = require("./main/telegraf");

try {
runServer(bot);
runBot(bot).catch(console.log);
} catch (error) {
}

