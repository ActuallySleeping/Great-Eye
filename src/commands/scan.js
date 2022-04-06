"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = void 0;
const publ = require("../configs/public.json");
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpGetAsync = (url, callback) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onload = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
};
const displayDate = (date) => {
    const dt = (number) => {
        if (number < 10)
            return '0' + number;
        return number.toString();
    };
    let diff = (Date.now() - date) / 1000;
    let hours = 0, minutes = 0, seconds = 0;
    while (diff > 60 * 60 * 24) {
        hours += 24;
        diff -= 60 * 60 * 24;
    }
    while (diff > 60 * 60) {
        hours += 1;
        diff -= 60 * 60;
    }
    while (diff > 60) {
        minutes += 1;
        diff -= 60;
    }
    while (diff > 0) {
        seconds += 1;
        diff -= 1;
    }
    return `${dt(hours)}:${dt(minutes)}:${dt(seconds)}`;
};
const generate = (message, server) => {
    try {
        const url = `https://www.battlemetrics.com/servers/ark/${server.attributes.id}`;
        httpGetAsync(url, function (response) {
            if (!response)
                return message.reply('Server not found');
            const json = JSON.parse(response.split('<script id="storeBootstrap" type="application/json">')[1].split('</script>')[0]);
            if (!json.state.sessions)
                return message.reply('Server not found');
            const players = json.state.sessions.sessions;
            let p = [];
            for (let id in players) {
                const player = players[id];
                p.push({
                    name: player.name,
                    id: player.id,
                    start: player.start,
                });
            }
            p = p.sort((a, b) => {
                return a.start - b.start;
            });
            message.reply("```" +
                `\n${server.attributes.name}  (${server.attributes.players}/${server.attributes.maxPlayers})` + '\n' + '\n' +
                `${server.attributes.ip}:${server.attributes.port}\n\`\`\`` +
                "```" + '\n' +
                "     [Time Pld] Steam Name" + '\n' + '\n' +
                p.map(player => `   ${p.indexOf(player) + 1} [${displayDate(player.start)}]  ${player.name}`).join('\n') +
                //"+  8 [00:00:19] 123" + '\n' +
                //"+  9 [**:**:**] [EPIC player]" + '\n' +
                "```")
                .then(msg => {
                if (publ.cooldown.delete.scan > 0) {
                    setTimeout(() => msg.delete().catch(e => { return; }), publ.cooldown.delete.scan * 1000);
                }
            });
        });
    }
    catch (e) {
        //console.log(e)
    }
};
class scan {
    permissions = [];
    disabled = false;
    name = 'scan';
    guildOnly = true;
    args = true;
    cooldown = publ.cooldown.scan;
    aliases = ['s'];
    execute(message, args, client, localDB) {
        const serversQuery = `https://api.battlemetrics.com/servers?` +
            `filter[game]=ark&filter[status]=online&filter[search]=${args[0]}&page[size]=100&filter[features][2e079b9a-d6f7-11e7-8461-83e84cedb373]=true`;
        httpGetAsync(serversQuery, (response) => {
            if (!response)
                return message.reply("No servers found");
            const json = JSON.parse(response);
            const servers = json.data.filter(e => args.every(arg => e.attributes.name.includes(arg)));
            if (servers.length == 0) {
            }
            else if (servers.length == 1) {
                generate(message, servers[0]);
            }
            else {
                message.reply("** The request need to be more specific. **" + '\n' +
                    "```" +
                    servers.slice(0, 10).map(server => `${server.attributes.name} (${server.attributes.players}/${server.attributes.maxPlayers})`).join('\n') +
                    "```")
                    .then(msg => {
                    if (publ.cooldown.delete.scan > 0) {
                        setTimeout(() => msg.delete().catch(e => { return; }), publ.cooldown.delete.scan * 1000);
                    }
                });
            }
        });
    }
    ;
}
exports.scan = scan;
