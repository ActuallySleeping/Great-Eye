
import { Message, Client } from "discord.js";
import command from "../interfaces/command";
import prisma from "../database";

import * as publ from '../configs/public.json';
import { messageDAO } from "../classes/messageDAO";

export class stop implements command {
	permissions = [];
	disabled = false;
	name = 'stop';
	guildOnly = true;
	args = false;
	cooldown = publ.cooldown.default;
	aliases = [];
	async execute(message : Message, args : string[], client : Client) {

        if ( await messageDAO.delete(message.channel.id) ){
			message.channel.send("Stopped watching this channel!");
			
		} else {
			message.channel.send("I wasn't watching this channel!");
		}

    };
}