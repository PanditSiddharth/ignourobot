const express = require('express');
const config = require('./config');
const { Telegraf, Context } = require("telegraf");

/**
 * 
 * @param {Telegraf<Context<import('telegraf/types').Update>>} bot 
 */
const runServer = async (bot) => {
const app = express();

// Initialize
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/bot', async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error('Bot update error:', err);
        res.status(500).json({ error: 'Bot update failed' });
    }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    if (config.nodeEnv === 'development') {
        bot.launch({ dropPendingUpdates: true })
            .then(() => console.log('Bot launched in development mode'))
            .catch(console.error);
    }
});

}

module.exports = runServer