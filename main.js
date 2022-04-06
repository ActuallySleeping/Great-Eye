"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const discord_js_1 = require("discord.js");
const sqlite = require("sqlite3");
let sqlite3 = sqlite.verbose();
const priv = require("./src/configs/private.json");
let localDB;
const localDB_location = `${__dirname}/src/base.sqlite3`;
/*
We need to check if the database file exists, if it does not, it will automatically create a new database.
This database will have all the tables set up to use the bot.
*/
if (fs.existsSync(localDB_location)) {
    localDB = new sqlite3.Database(localDB_location);
}
else {
    localDB = new sqlite3.Database(localDB_location);
    localDB.run('CREATE TABLE PLAYERS (' +
        'id			    TEXT,' +
        'player_id	 	TEXT,' +
        'server_id		TEXT,' +
        'start  		TEXT,' +
        'stop   		TEXT,' +
        'name   		TEXT,' +
        'firstTime		TEXT,' +
        'PRIMARY KEY(id)' +
        ')');
}
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
    h.default(client, localDB);
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
    events.default(client, message, localDB, cooldowns);
});
/*client.on('interactionCreate', async (interaction) => {
    const eventsPath = `./src/events/interactionCreate`;

    const events = await import(eventsPath);

    events.default(client, localDB, interaction);
});*/
client.login(priv.token);
