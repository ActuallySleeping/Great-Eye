
import { Message, MessageEmbed, Client, PermissionResolvable } from "discord.js";
import { Database } from "sqlite3";
import command from "../interfaces/command";

import * as publ from '../configs/public.json';


export class hello implements command {
	permissions = [];
	disabled = false;
	name = 'hello';
	guildOnly = true;
	args = false;
	cooldown = publ.cooldown.hello;
	aliases = ['h'];
	execute(message : Message, args : String[], client : Client, localDB : Database) {

		message.reply("World")
		.then(msg => {
				if (publ.cooldown.delete.hello > 0) {
					setTimeout(() => msg.delete().catch(e => {return}), publ.cooldown.delete.hello * 1000) 
				}   
			});

	};
}