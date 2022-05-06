
import { Message, Client } from "discord.js";
import command from "../interfaces/command";
import prisma from "../database";

import * as publ from '../configs/public.json';
import { Alliance } from "@prisma/client";

type player = {
    id : string
    tribe? : string
    status? : string
    name? : string
    comment? : string
}

type tribe = {
    name : string
    status? : string
    alliance? : string
}
export class add implements command {
	permissions = [];
	disabled = false;
	name = 'add';
	guildOnly = true;
	args = true;
	cooldown = publ.cooldown.default;
	aliases = ['a'];
	async execute(message : Message, args : string[], client : Client) {

        if ( args.includes('-player') ){

            let player : player = { id: "" }

            for (let i = 0; i < args.length; i+= 2) {
                if( args[i] == '-player'){
                    if ( args[i+1].length < 36 ){
    
                        message.reply("Player id is too short!");
                        return;
                    }
            
                    if ( args[i+1].length > 38 ){
            
                        message.reply("Player id is too long!");
                        return;
                    }
    
                    // c154a524-b58f-11ec-90fc-68cb0d616a34
                    // <c154a524-b58f-11ec-90fc-68cb0d616a34>
                    if ( 
                        !RegExp(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g).test(args[i+1])
                    ){
                            
                            message.reply("Player id is not valid!");
                            return;
                    }
    
                    player.id = args[i+1].replaceAll(new RegExp(/[<>]/g), '')
                }
                if( args[i] == '-tribe'){
                    player.tribe = args[i+1]
                }
                if( args[i] == '-status'){
                    player.status = args[i+1]
                }
                if( args[i] == '-name'){
                    player.name = args[i+1]
                }
                if( args[i] == '-comment'){
                    player.comment = args[i+1]
                }
            }

            const playerTribe = await prisma.prisma.tribe.findFirst({
                where: {
                    name: player.tribe
                }
            })
            
            if( playerTribe == null ){
                await prisma.prisma.tribe.create({
                    data: {
                        name: player.tribe,
                    }
                })
            }

            prisma.prisma.player.upsert({
                where: {
                    battlemetrics_id: player.id
                },
                create: {
                    battlemetrics_id: player.id,
                    tribe: {
                        connect: {
                            name: player.tribe
                        }
                    },
                    status: player.status ? parseInt(player.status) : playerTribe.status,
                    name: player.name,
                    comment: player.comment
                },
                update: {
                    tribe: {
                        connect: {
                            name: player.tribe
                        }
                    },
                    status: player.status ? parseInt(player.status) : playerTribe.status,
                    name: player.name,
                    comment: player.comment
                },
            }).then(_ => {
                message.reply("Player added!");
            })
            .catch(e => {
                console.log(e)
            })
        } else if ( args.includes('-tribe')){

            let tribe : tribe = { name: ""}

            for (let i = 0; i < args.length; i+= 2) {
                if( args[i] == '-tribe'){
    
                    tribe.name = args[i+1];
                }
                if(args[i] == '-status'){
                    tribe.status = args[i+1];
                }
                if(args[i] == '-alliance'){
                    tribe.alliance = args[i+1];
                }
            }

            let a : Alliance
            if( tribe.alliance )
                a = await prisma.prisma.alliance.upsert({
                    where: {
                        name: tribe.alliance
                    },
                    create: {
                        name: tribe.alliance,              
                    },
                    update: {}
                })

            prisma.prisma.tribe.upsert({
                where: {
                    name: tribe.name
                },
                create: {
                    name: tribe.name,
                    alliance_name: a ? a.name : undefined
                },
                update: {
                    alliance_name: a ? a.name : undefined,
                    status: parseInt(tribe.status),
                },
            }).then(_ => {
                message.reply("Tribe added!");
            })
            .catch(e => {
                console.log(e)
                message.reply("Error creating/adding the tribe!");
            })

        }

    };
}