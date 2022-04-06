
import { Message, Client, PermissionResolvable } from "discord.js";
import { Database } from "sqlite3";

interface command {
	disabled: boolean,
    name: string,
	guildOnly: boolean,
	args: boolean,
	cooldown: number,
	aliases: String[],
	permissions: PermissionResolvable[],
	execute(message : Message, args : String[], client : Client, localDB : Database): void
}

export default command;