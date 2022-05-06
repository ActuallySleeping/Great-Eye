
import { Message, Client, TextChannel, ThreadChannel } from "discord.js";
import command from "../interfaces/command";
import prisma from "../database";
import { messageDAO } from "../classes/messageDAO";
import { requestServers } from "../classes/battlemetrics";

import * as publ from '../configs/public.json';

export class watch implements command {
	permissions = [];
	disabled = false;
	name = 'watch';
	guildOnly = true;
	args = true;
	cooldown = publ.cooldown.default;
	aliases = ['w'];
	async execute(message : Message, args : string[], client : Client) {9

        let m = await messageDAO.get(message.channel.id)

        if ( m ) {
            message.channel.send("I was already watching this channel!");
            
        } else {

            const data = await requestServers(args[0], []);

            let servers = data.data.data.filter((e : any) => e.attributes.name.toLowerCase().includes(args[0].toLowerCase()));

            if ( servers.length == 0 ){

            } else if ( servers.length == 1 ){

                const msg = await message.channel.send(`${servers[0].attributes.name} is now watched in this channel!`);

                messageDAO.save(message, msg.id, servers[0].id).then(() => {
                    if ( msg.channel instanceof TextChannel || msg.channel instanceof ThreadChannel)
                        messageDAO.updateChannel(msg.channel);
                });

            } else {

                message.channel.send(
                    "```diff" + '\n' +
                    servers.map((server : any) => `${server.attributes.status == 'online' ? "+" : "-"}  ${servers.indexOf(server)} ${server.attributes.name}`).join('\n') + '\n' +
                    "```"
                )
                .then( async _ => {

                    for await ( let i of [...Array(20).keys()]){
                        
                        const res = await new Promise((resolve) => {
                            setTimeout(async () => {
                                const last = (await message.channel.messages.fetch({ limit: 1 })).first();
    
                                if ( last.author.bot ) resolve(0)
    
                                console.log(
                                    new RegExp(/^[0-9]/g).test(last.content),
                                    last.content >= "0",
                                    last.content < `${servers.length}`
                                )
                                if ( new RegExp(/^[0-9]/g).test(last.content) && last.content >= "0" && last.content < `${servers.length}` ){

                                    const msg = await message.channel.send(`${servers[last.content].attributes.name} is now watched in this channel!`);

                                    messageDAO.save(message, msg.id, servers[last.content].id).then(() => {
                                        if ( msg.channel instanceof TextChannel || msg.channel instanceof ThreadChannel)
                                            messageDAO.updateChannel(msg.channel);
                                    });
                                    
                                } else {
                                    resolve(-1)
                                }
    
                            }, 0.5 * 1000);
                        })
    
                        if ( res == -1 ) break;
    
                        if ( res == 1 ) break;
                    }
    
                });
            }
        } 

    };
}