import * as fs from 'fs';

import { Client, Collection, Intents } from 'discord.js';

import { PrismaClient } from '@prisma/client'

import * as publ from './src/configs/public.json';
import * as priv from './src/configs/private.json';

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

        h.default();
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
        
        events.default(client, message, cooldowns);
	});

	/*client.on('interactionCreate', async (interaction) => {
        const eventsPath = `./src/events/interactionCreate`;

        const events = await import(eventsPath);

        events.default(client, localDB, interaction);
	});*/

client.login(priv.token);


