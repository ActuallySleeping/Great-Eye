import command from '../interfaces/command';

const getCommands = async  () => {

	let commands : command[] = [];

	const _add = await import('../commands/add')
	commands.push(new _add.add)
    
    const _scan = await import('../commands/scan')
	commands.push(new _scan.scan)

	const _watch = await import('../commands/watch')
	commands.push(new _watch.watch)

	const _stop = await import('../commands/stop')
	commands.push(new _stop.stop)

	return commands;
}


export default getCommands;