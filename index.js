// import runBot from "./main/bot";
import { runBot } from "./bot/index.js";
import runServer from "./api/server.js";
import bot from "./main/telegraf.js";

try {
runServer(bot);
runBot(bot).catch(console.log);
} catch (error) {
}

