
import { Message, Client, PermissionResolvable } from "discord.js";

interface command {
	disabled: boolean,
    name: string,
	guildOnly: boolean,
	args: boolean,
	cooldown: number,
	aliases: String[],
	permissions: PermissionResolvable[],
	execute(message : Message, args : String[], client : Client): void
}

export default command;