
import * as fs from 'fs';

import { Message, Client, StoreChannel, SystemChannelFlags } from "discord.js";
import { Database } from "sqlite3";
import command from "../interfaces/command";

import * as publ from '../configs/public.json';
import { RESTJSONErrorCodes } from 'discord-api-types';

const MAPS_NAME : Map<String, String> = new Map([
    ['1', 'Island'],
    ['2', 'Ragnarok'], 
    ['3', 'Lost Island'], 
    ['4', 'Crystal Isles'], 
    ['5', 'Genesis 2'],
    ['6', 'Valguero'],  
    ['7', 'Extinction'],
    ['8', 'Aberration'],
    ['9', 'Genesis'],
    ['10', 'The Center'],
    ['11', 'Scorched Earth'],
])  

const MAPS : Map<String, String> = new Map([
    ["1", "332a4834-d6f7-11e7-8461-27f523657d7e"], // Island
    ["2", "332a41f4-d6f7-11e7-8461-bff8389e804a"], // Ragnarok
    ["3", "3472842a-5d4b-11ec-b2cc-eb9045109701"], // Lost Island
    ["4", "332a4bc2-d6f7-11e7-8461-1b81017c658f"], // Crystal Isles
    ["5", "f2190a60-c86f-11eb-b2cc-9f0589df446e"], // Genesis 2
    ["6", "df2933f0-922d-11e9-9a0b-f78bed7056b4"], // Valguero
    ["7", "595ca33e-e22d-11e8-9bbf-dbb4d90ec4ae"], // Extinction
    ["8", "c4249f12-df6a-11e7-967b-bb54312b6462"], // Aberration
    ["9", "b05279aa-5c1d-11ea-8764-4fca14776b85"], // Genesis
    ["10", "332a4942-d6f7-11e7-8461-5b2010618477"], // The Center
    ["11", "332a4a14-d6f7-11e7-8461-a3f11c39d791"], // Scorched Earth
])

let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const httpGetAsync = (url : string, delay : number) => { return new Promise ((resolve,reject) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onload = async function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    
            await new Promise(resolve => setTimeout(resolve, delay));

            resolve(xmlHttp.responseText);
            
        }else {
            await new Promise(resolve => setTimeout(resolve, 5000))
            console.log("t", url, xmlHttp);
            reject('error')
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
})}

const displayDate = (date : number) => {

    const dt = (number : number) : string => {
        if(number < 10) return '0' + number;
        return number.toString();
    }

    let diff = (Date.now() - date) / 1000;

    let hours = 0, minutes = 0, seconds = 0;
    
    while( diff > 60 * 60 * 24){ hours += 24; diff -= 60 * 60 * 24}
    while( diff > 60 * 60 ){ hours += 1; diff -= 60 * 60 }
    while( diff > 60 ){ minutes += 1; diff -= 60 }
    while( diff > 0 ){ seconds += 1; diff -= 1 }

    return `${dt(hours)}:${dt(minutes)}:${dt(seconds)}`;
}

const generate = async (message : Message<boolean>, server : any) => {

    const url = `https://www.battlemetrics.com/servers/ark/${server.attributes.id}`
    
    let response = (await httpGetAsync(url, 0)).toString()
        
    if (!response) return message.reply('Could not query the server');

    if (response.includes('<script id="storeBootstrap" type="application/json">'))
        response = response.split('<script id="storeBootstrap" type="application/json">')[1]

    if (response.includes('</script>'))
        response = response.split('</script>')[0]

    let json : any
    try{
        json = JSON.parse(response)
    } catch (e) {

        console.log(e)
        return;
    }

    if(!json.state.sessions) {

        return message.reply(
            "```"+
            `\n${server.attributes.name}  (${server.attributes.players}/${server.attributes.maxPlayers})` + '\n' + '\n' +
            `${server.attributes.ip}:${server.attributes.port}\n\`\`\`` +
    
            "```" + '\n' +
            "    [Time Pld] <             player-id              > Steam Name" + '\n' + '\n' +
            "No Players Online"+
    
            "```"
    
        )
    }

    const players = json.state.sessions.sessions

    let p : {name : any, id: any, start: any}[] = []

    for ( let id in players){
        const player = players[id];

        p.push({
            name: player.name,
            id: player.id,
            start: player.start,
        })                
    }

    p = p.sort((a, b) => {
        return a.start - b.start
        })

    const send = (i) => {
        return p.slice(i,i+20)
        .map(player => 
            ` ${ p.indexOf(player) + 1 < 10 ? '0' + (p.indexOf(player) + 1) : p.indexOf(player) + 1 } `+ 
            `[${displayDate(player.start)}] `+
            `<${player.id}> ${player.name}`
            )
        .join('\n')
    }

    message.reply(
        "```"+
        `\n${server.attributes.name}  (${server.attributes.players}/${server.attributes.maxPlayers})` + '\n' + '\n' +
        `${server.attributes.ip}:${server.attributes.port}\n\`\`\`` +

        "```" + '\n' +
        "    [Time Pld] <             player-id              > Steam Name" + '\n' + '\n' +
        send(0) +

        "```"

    )
    .then(_ => {

        if( p.length > 20 )

            message.channel.send(
                "```" + '\n' +
                send(20) +

                "```"
            ).then(_ => {
                if( p.length > 40 )

                message.channel.send(
                    "```" + '\n' +
                    send(40) +
    
                    "```"
                ).then(_ => {
                    if( p.length > 60 )

                    message.channel.send(
                        "```" + '\n' +
                        send(60) +
        
                        "```"
                    )
                })
            })
    });
}

export class scan implements command {
	permissions = [];
	disabled = false;
	name = 'scan';
	guildOnly = true;
	args = true;
	cooldown = publ.cooldown.scan;
	aliases = ['s'];
	async execute(message : Message, args : string[], client : Client) {

        let mapQuery = "", popQuery = "";

        if ( args.length > 1 ){
            if ( args[0].charAt(0) === '-' ){
                message.reply('Invalid server name (Server name must be first)');

                return;
            }

            if ( args.some(e => e == "-map") ){

                const map = args.findIndex(e => e == "-map") + 1

                if ( !MAPS.has(args[map]) ) return message.reply('Map not found');

                mapQuery = `&filter[features][2e0790dc-d6f7-11e7-8461-b3f086e6eb8c][or][0]=` + MAPS.get(args[map])
                
            }
            if ( args.some(e => e == "-pop")){

                popQuery = `&filter[players][min]=1`

            }
        }

        const serversQuery = `https://api.battlemetrics.com/servers?`+
        `filter[game]=ark&filter[search]=${args[0]}&page[size]=100&sort=players`+

        // Server Pop >= 1
        popQuery +

        // Island
        mapQuery + 

        // Enable Official Only
        `&filter[features][2e079b9a-d6f7-11e7-8461-83e84cedb373]=true`+

        // Disable PVE Servers
        `&filter[features][0eff04dc-e9ce-11e8-8977-231f2f82f764]=false`

        const response = (await httpGetAsync(serversQuery, 0)).toString()

        if ( !response ) message.reply('Error with the query').then(msg => { setTimeout(() => msg.delete().catch(e=>{return;}) , 4 * 1000) });

        const json = JSON.parse(response);

        //console.log(serversQuery)
        //console.log(json.data.map(e => `${e.id} ${e.attributes.name}`))

        let servers = json.data.filter(e => e.attributes.name.toLowerCase().includes(args[0].toLocaleLowerCase()));

        const onlines = servers.filter(e => e.attributes.status === 'online')

        if ( servers.length == 0){

            message.reply(
                'No server found with that name.'+ '\n' +
                'Use `-map <map-number>` to specify the server map.' + '\n' +
                '   Available maps:' + '\n' +
                '     ' + Array.from(MAPS_NAME.keys()).map(e => `${e} - ${MAPS_NAME.get(e)}`).join('\n     ') + '\n' + '\n' +
                
                'Examples of valid queries:' + '\n' +
                '   `&scan r57`' + '\n' +
                '   `&scan d8 -map 1`' + '\n' 

            )

        } else

        if ( onlines.length == 1 && servers.length == 1){

            generate(message, onlines[0])
            
        } else

        {
            if ( onlines.length > 10 ) servers = onlines

            message.reply(
                "  **The request need to be more specific or the server is offline. **" + '\n' +
                "      *La demande doit être plus précise ou le serveur est hors ligne.*" + '\n' +
                "```diff" + '\n' +
                servers.slice(0,10).map((server: any)=> `${server.attributes.status === 'online' ? '+' : '-'} ${servers.indexOf(server)} ${server.attributes.name} (${ server.attributes.status === 'online' ? server.attributes.players + "/" + server.attributes.maxPlayers : "offline"})`).join('\n') +
                "```"

            )
            .then( async _ => {

                let it = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
                for await ( let i of it){
                    const waitInput = () => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                message.channel.messages.fetch({limit: 1}).then(async msg => {
                                    if ( !msg.first().author.bot ){

                                        const selected = msg.first().content.split(' ')[0]

                                        if ( !selected.match(new RegExp(/^[0-9]$/g)) )reject("Invalid input")

                                        await generate(message, servers[selected])
                                        resolve(0)

                                    }
                                    reject("Last Message is a bot message")
                                }).catch(e => {reject("No message found")})
                                
                            }, 0.5 * 1000);
                        })
                    }

                    await waitInput().then( function() {
                        return;
                    })
                    .catch(e => {
                    })
                }

            });
        }
	};
}