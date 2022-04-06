import * as fs from 'fs';

import { Client, Collection, Intents } from 'discord.js';

import * as sqlite from 'sqlite3';
let sqlite3 = sqlite.verbose();

import * as publ from './src/configs/public.json';
import * as priv from './src/configs/private.json';

let localDB : sqlite.Database;
const localDB_location = `${__dirname}/src/base.sqlite3`;

/*
We need to check if the database file exists, if it does not, it will automatically create a new database.
This database will have all the tables set up to use the bot.
*/
if( fs.existsSync(localDB_location) ){
	localDB = new sqlite3.Database(localDB_location);
} else {
	localDB = new sqlite3.Database(localDB_location);
	localDB.run('CREATE TABLE PLAYERS ('+
		'id			    TEXT,'+
		'player_id	 	TEXT,'+
		'server_id		TEXT,'+
        'start  		TEXT,'+
        'stop   		TEXT,'+
        'name   		TEXT,'+
        'firstTime		TEXT,'+
		'PRIMARY KEY(id)'+
		')');
}

const client = new Client({
	intents : [
		Intents.FLAGS.GUILDS, 
		Intents.FLAGS.GUILD_MESSAGES, 
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS
		],
});

	/* Handler of Handlers */
	['commands'].forEach( async (handler) => {
        const handlerPath = `./src/handlers/${handler}`;

        const h = await import(handlerPath);

        h.default(client, localDB);
	});

	/* Event Handler */
	/*client.on('ready', async () => {
        const eventsPath = `./src/events/ready`;

        const events = await import(eventsPath);

        events.default(client, localDB);
	});*/

    let cooldowns : Collection<string, Collection<string, number>> = new Collection();

	client.on('messageCreate', async (message) => {
        const eventsPath = `./src/events/messageCreate`;

        const events = await import(eventsPath);
        
        events.default(client, message, localDB, cooldowns);
	});

	/*client.on('interactionCreate', async (interaction) => {
        const eventsPath = `./src/events/interactionCreate`;

        const events = await import(eventsPath);

        events.default(client, localDB, interaction);
	});*/

client.login(priv.token);


