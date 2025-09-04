import express, { json, urlencoded } from 'express';
import { port, nodeEnv } from './config.js';
import { Telegraf, Context } from "telegraf";

/**
 * 
 * @param {Telegraf<Context<import('telegraf/types').Update>>} bot 
 */
const runServer = async (bot) => {
const app = express();

// Initialize
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.post('/api/bot', async (req, res) => {
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
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (nodeEnv === 'development') {
        bot.launch({ dropPendingUpdates: true })
            .then(() => console.log('Bot launched in development mode'))
            .catch(console.error);
    }
});

}

export default runServer