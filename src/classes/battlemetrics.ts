
import axios from "axios";
import { AxiosResponse } from "axios";
import * as priv from "../configs/private.json";
import { Message } from "discord.js";
import prisma from "../database";
import { Tribe } from "@prisma/client";

export type option = `&filter[status]=offline` | `&filter[status]=online` |  `&filter[players][min]=0` | `&filter[players][min]=1` | `&filter[features][2e0790dc-d6f7-11e7-8461-b3f086e6eb8c][or][0]=${string}` 

export type MAP = "Island" | "Ragnarok" | "Lost Island" | "Crystal Isles" | "Genesis 2" | "Valguero" | "Extinction" | "Aberration" | "Genesis" | "The Center" | "Scorched Earth" 
export type MAP_INDEX = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11"
export type MAP_VALUE = "332a4834-d6f7-11e7-8461-27f523657d7e" |
    "332a41f4-d6f7-11e7-8461-bff8389e804a" |
    "3472842a-5d4b-11ec-b2cc-eb9045109701" |
    "332a4bc2-d6f7-11e7-8461-1b81017c658f" |
    "f2190a60-c86f-11eb-b2cc-9f0589df446e" |
    "df2933f0-922d-11e9-9a0b-f78bed7056b4" |
    "595ca33e-e22d-11e8-9bbf-dbb4d90ec4ae" |
    "c4249f12-df6a-11e7-967b-bb54312b6462" |
    "b05279aa-5c1d-11ea-8764-4fca14776b85" |
    "332a4942-d6f7-11e7-8461-5b2010618477" |
    "332a4a14-d6f7-11e7-8461-a3f11c39d791"

export const MAPS_NAME : Map<MAP_INDEX, MAP> = new Map([
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

export const MAPS : Map<MAP_INDEX, MAP_VALUE> = new Map([
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


const api = () => {
    return axios.create({
        baseURL : `https://api.battlemetrics.com/`,
        headers: {'Authorization': `Bearer ${priv.tokens.battlemetrics}`}
    });
}

const website = () => {
    return axios.create({
        baseURL : `https://battlemetrics.com/`,
    });
}

export const getServer = async (server_id : string) : Promise<AxiosResponse> => {
    
    let response : AxiosResponse;

    try {
        response = await axios.get(`https://api.battlemetrics.com/servers/${server_id}`);

    } catch (e) {
        if ( e.response.headers['x-rate-limit-remaining'] <= 0){
            await new Promise(resolve => setTimeout(resolve, parseInt(e.response.headers['retry-after']) * 1050 )); 
            return await getServer(server_id);

        } else
            throw e;
    }

    return response;
}

export const requestServers = async (server_name : string, options? : option[]) : Promise<AxiosResponse> => {
        let response : AxiosResponse;

        try {
            response = await api().get(
                `/servers?filter[game]=ark&page[size]=100&sort=players`+
                `&filter[features][2e079b9a-d6f7-11e7-8461-83e84cedb373]=true`+ // Enable Official Only
                `&filter[features][0eff04dc-e9ce-11e8-8977-231f2f82f764]=false`+ // Disable PVE Servers
                `&filter[search]=${server_name}${options ? options.join('') : ""}`
            );

        } catch (e) {
            
            if ( e.response.headers['x-rate-limit-remaining'] <= 0){
                await new Promise(resolve => setTimeout(resolve, parseInt(e.response.headers['retry-after']) * 1050 )); 
                return await requestServers(server_name, options);

            } else
                throw e;
        }

        return response;
    }

export const getServerPlayers = async (server_id : string) : Promise<any> => {
        let response : AxiosResponse;
        
        response = (await website().get(`servers/ark/${server_id}`))

        if (!response) return undefined;

        let data = response.data

        if (data.includes('<script id="storeBootstrap" type="application/json">'))
            data = data.split('<script id="storeBootstrap" type="application/json">')[1]
    
        if (data.includes('</script>'))
            data = data.split('</script>')[0]

        let json = JSON.parse(data)

        if ( !json.state.sessions ) return []

        return json.state.sessions.sessions
    }

export const displayDate = (date : number) => {

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
    
export const generateMessage = async (server : any, ids? : boolean) : Promise<string[]> => {

    const messages : string[] = [];

    const players = await getServerPlayers(server.id);

    if ( !players ) return ['No players found'];

    messages.push(
        "```"+
        `\n${server.attributes.name}  (${server.attributes.players}/${server.attributes.maxPlayers})` + '\n' + '\n' +
        `${server.attributes.ip}:${server.attributes.port}\n\`\`\``
    )
    
    if( Object.keys(players).length == 0) {
        messages.push(
            "```diff"+ "\n" +
            "  [Time Pld]  Steam Name" + '\n' + '\n' +
            "  No Players Online" + '\n' + '\n' +
            "```"
        )

        return messages;
    }

    let p : {name : any, id: any, start: any}[] = []

    for ( let id in players){
        const player = players[id];

        p.push({
            name: player.name,
            id: player.id,
            start: player.start,
        })                
    }

    p = p.sort((a, b) => { return a.start - b.start})


    const add = async (i : number) => {  
        const players = p.slice(i,i+15)

        let content = "```diff"+ "\n" +
            (i == 0 ? `  [Time Pld]  ${ ids ? "<        -    - ID -    -            >  " : "" }Steam Name` + '\n' + '\n' : "")
        for await (let player of players){

            let p = await prisma.prisma.player.findUnique({
                where: {
                    battlemetrics_id: player.id
                }
            })
            let t : Tribe = undefined
            if(p) t = await prisma.prisma.tribe.findUnique({ where: { name: p.tribe_name } })

            let status = 
                `${p ? 
                    (p.status ? 
                        p.status > 0 ? "+" : "-"
                        : (t.status ?
                            t.status > 0 ? "+" : "-"
                            : " "
                        )
                    ) 
                    : " "}`

            if(ids) content += `${status} [${displayDate(player.start)}]  <${player.id}>  ${player.name}\n`
            else content += `${status} [${displayDate(player.start)}]  ${player.name}${p ? (p.tribe_name ? ` (${p.tribe_name})` : "") : ""}\n`

        }
        content += "```"

        messages.push(content)
    }

    await add(0)
    if ( p.length > 15 ) await add(15)
    if ( p.length > 30 ) await add(30)
    if ( p.length > 45 ) await add(45)
    if ( p.length > 60 ) await add(60)

    return[messages, players];
}