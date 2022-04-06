"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const priv = require("./src/configs/private.json");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
});
/* Handler of Handlers */
['commands'].forEach(async (handler) => {
    const handlerPath = `./src/handlers/${handler}`;
    const h = await Promise.resolve().then(() => require(handlerPath));
    h.default();
});
/* Event Handler */
/*client.on('ready', async () => {
    const eventsPath = `./src/events/ready`;

    const events = await import(eventsPath);

    events.default(client, localDB);
});*/
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
client.login(priv.token);
