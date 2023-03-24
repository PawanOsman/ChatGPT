import express, { json, urlencoded } from 'express';
import { completions, chatCompletions } from './routes.js';
import { corsMiddleware, rateLimitMiddleware } from './middlewares.js';
import { SERVER_PORT } from './config.js';

let app = express();

process.on("uncaughtException", function (err) {
    if (DEBUG) console.error(`Caught exception: ${err}`);
});

// Middlewares
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));

// Register routes
app.all("/", async function (req, res) {
    res.set("Content-Type", "application/json");
    return res.status(200).send({
        status: true,
        github: "https://github.com/PawanOsman/ChatGPT",
        discord: "https://discord.pawan.krd"
    });
});
app.post("/api/completions", completions);
app.post("/api/chat/completions", chatCompletions);

// Start server
app.listen(SERVER_PORT, () => {
    console.log(`Listening on ${SERVER_PORT} ...`);
});