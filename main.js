"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const discord_js_1 = require("discord.js");
const priv = require("./src/configs/private.json");
const axios_1 = require("axios");
const cloudflare = require("axios-cloudflare");
cloudflare(axios_1.default);
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
});
/* Event Handler */
client.on('ready', async () => {
    const eventsPath = `./src/events/ready`;
    const events = await Promise.resolve().then(() => require(eventsPath));
    events.default(client);
    /* Handler of Handlers */
    const handlers = fs.readdirSync('./src/handlers').filter(handler => handler.endsWith('.js'));
    handlers.forEach(async (handler) => {
        const handlerPath = `./src/handlers/${handler}`;
        const h = await Promise.resolve().then(() => require(handlerPath));
        h.default(client);
    });
});
let cooldowns = new discord_js_1.Collection();
client.on('messageCreate', async (message) => {
    const eventsPath = `./src/events/messageCreate`;
    const events = await Promise.resolve().then(() => require(eventsPath));
    events.default(client, message, cooldowns);
});
/*client.on('interactionCreate', async (interaction) => {
    const eventsPath = `./src/events/interactionCreate`;

    const events = await import(eventsPath);

    events.default(client, localDB, interaction);
});*/
client.login(priv.tokens.discord);
