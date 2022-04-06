
import { Collection } from 'discord.js';
import * as fs from 'fs';

import command from '../interfaces/command';

const getCommands = async  () => {

	let commands : command[] = [];

	const _hello = await import('../commands/hello')
	commands.push(new _hello.hello)
    
    const _scan = await import('../commands/scan')
	commands.push(new _scan.scan)

	return commands;
}


export default getCommands;