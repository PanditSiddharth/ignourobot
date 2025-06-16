require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    botToken: process.env.TOKEN,
    testChat: process.env.TEST_CHAT,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI
};
