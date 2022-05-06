
import { Client } from 'discord.js';

const repeat = async  (client : Client<boolean>) => {

	const messageDAO = await import('../classes/messageDAO')
    messageDAO.messageDAO.generate(client);

}

export default repeat;