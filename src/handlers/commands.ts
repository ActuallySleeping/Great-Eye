
import { Collection } from 'discord.js';
import * as fs from 'fs';

import command from '../interfaces/command';

const getCommands = async  () => {

	let commands : command[] = [];

	const _add = await import('../commands/add')
	commands.push(new _add.add)
    
    const _scan = await import('../commands/scan')
	commands.push(new _scan.scan)

	return commands;
}


export default getCommands;