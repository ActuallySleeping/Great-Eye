
import { Client, Message, TextChannel, ThreadChannel } from "discord.js";
import command from "../interfaces/command";
import prisma from "../database";
import * as prismaClient from "@prisma/client";

import * as publ from '../configs/public.json';
import axios from "axios";
import { getServer, generateMessage } from "./battlemetrics";

export class messageDAO {

    public static async save( message : Message, message_id : string, server_id : string) : Promise<void>{

        await prisma.prisma.message.create({
            data: {
                message_id: message_id,
                channel_id: message.channel.id,
                guild_id: message.guild.id,
                author_id: message.author.id,
                server_id: server_id,
            },      
        });
    }

    // return a boolean depending on if the message was in the database before.
    public static async delete(channel_id : string) : Promise<boolean>{

        let m = await messageDAO.get(channel_id)

        if ( !m ) return false;

        await prisma.prisma.message.delete({
            where: {
                channel_id: channel_id,
            },
        });

        return true;
    }

    public static async get(channel_id : string) : Promise<prismaClient.Message>{
        return await prisma.prisma.message.findUnique({
            where: {
                channel_id: channel_id,
            },
        });
    }

    public static async getAll() : Promise<prismaClient.Message[]>{
        return await prisma.prisma.message.findMany();
    }

    public static async generate(client : Client<boolean>) : Promise<void> {

        console.log('Loading messages...');

        const Channels = await this.getAll();
        
        for (const Channel of Channels){
            
            client.channels.fetch(Channel.channel_id).then(async (channel) => {

                if ( channel instanceof TextChannel || channel instanceof ThreadChannel) {

                    this.updateChannel(channel)
                }
            })

        }
    }

    public static updateChannel(channel : TextChannel | ThreadChannel) : void {

        let players : any = undefined;

        setInterval(async () => {

            const serverInfos = await messageDAO.get(channel.id)

            if ( serverInfos == null ) return;
            
            const server = await getServer(serverInfos.server_id);

            const messages = await channel.messages.fetch({limit: 100})

            for await ( let message of messages){
                message[1].delete().catch(() => {});
            }

            const infos = await generateMessage(server.data.data);

            for await ( let _ of infos[0]){
                channel.send(_)
            }
        
            if( !players ) players = Object.values(infos[1]);
            else {
                const currentPlayers : any = Object.values(infos[1])

                for await ( let _ of currentPlayers){
                    if( !players.map((e : any) => e.id).includes(_.id) ){
                        console.log(`${_.name} has joined the server`)
                    }
                }
                for await ( let _ of players){
                    if( !currentPlayers.map((e : any) => e.id).includes(_.id) ){
                        console.log(`${_.name} has left the server`)
                    }
                }

                players = currentPlayers;
            }

        }, 1 * 30 * 1000);
    }
}