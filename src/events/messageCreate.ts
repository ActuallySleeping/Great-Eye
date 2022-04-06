import { Collection, Client, Message, TextChannel, DMChannel, GuildChannel, ThreadChannel, Guild } from "discord.js";
import { Database } from "sqlite3";
import getCommands from "../handlers/commands";

import * as publ from '../configs/public.json';

export default async (client : Client, message : Message<boolean>, localDB : Database, cooldowns : Collection<String, Collection<String, number>>) => {
		if ( message.author.bot ) return;

		let commandName: string, args: string[];

        commandName = message.content.substr(1).split(" ")[0].toLowerCase()
        args = message.content.split(" ").slice(1)

		const commands = await getCommands();

		const command = commands.find(c => c.name == commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

		if (!command) return;
		if( command.disabled ) return;

		if (command.cooldown) {
			cooldowns.set(command.name, new Collection());
		}
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || publ.cooldown.default) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				return 
			}
		}
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			if(command.guildOnly && message.channel instanceof DMChannel){
				message.channel.send('This command cannot be used inside DMs')
				  .then(msg=>{setTimeout(() => msg.delete().catch(() => {return}), 4 * 1000)})
				return
			}

			if (command.permissions && (message.channel instanceof TextChannel || message.channel instanceof GuildChannel || message.channel instanceof ThreadChannel)) {
			 	const authorPerms = message.channel.permissionsFor(message.author);
			 	if (!authorPerms || !authorPerms.has(command.permissions)) {
			 		message.channel.send('You are missing the permissions to do it')
			 		  .then(msg=>{setTimeout(() => msg.delete().catch(() => {return}), 4 * 1000)})
			 		return
			 	}
			}
            
			if(command.args && !args.length){
				message.channel.send('You need to provide one/or more argument(s)')
				  .then(msg=>{setTimeout(() => msg.delete().catch(() => {return}), 4 * 1000)})
				return 
			}
           
			
			if( !( message.channel instanceof TextChannel
				||   message.channel instanceof ThreadChannel
				||   message.channel instanceof GuildChannel )
				
				|| !publ.channels.includes(message.channel.id)

			){
				message.channel.send('Please use a valid channel')
				  .then(msg=>{setTimeout(() => msg.delete().catch(() => {return}), 4 * 1000)})
				return 
			}

			command.execute(message, args.filter(n=>{return n!==''}), client, localDB);
		} catch (err) {
			console.log(err);
		}

};
