"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = void 0;
const battlemetrics_1 = require("../classes/battlemetrics");
const publ = require("../configs/public.json");
class scan {
    permissions = [];
    disabled = false;
    name = 'scan';
    guildOnly = true;
    args = true;
    cooldown = publ.cooldown.scan;
    aliases = ['s'];
    async execute(message, args, client) {
        let options = [];
        if (args.length > 1) {
            if (args[0].charAt(0) === '-') {
                message.reply('Invalid server name (Server name must be first)');
                return;
            }
            if (args.some(e => e == "-map")) {
                const map = args.findIndex(e => e == "-map") + 1;
                const index = args[map];
                if (!battlemetrics_1.MAPS.has(index))
                    return message.reply('Map not found');
                options.push(`&filter[features][2e0790dc-d6f7-11e7-8461-b3f086e6eb8c][or][0]=${battlemetrics_1.MAPS.get(index)}`);
            }
            if (args.some(e => e == "-pop"))
                options.push(`&filter[players][min]=1`);
            if (args.some(e => e == "-nopop"))
                options.push(`&filter[players][min]=0`);
            if (args.some(e => e == "-online"))
                options.push(`&filter[status]=online`);
            if (args.some(e => e == "-offline"))
                options.push(`&filter[status]=offline`);
        }
        const data = await (0, battlemetrics_1.requestServers)(args[0], options);
        let servers = data.data.data.filter((e) => e.attributes.name.toLowerCase().includes(args[0].toLowerCase()));
        const onlines = servers.filter((e) => e.attributes.status === 'online');
        if (servers.length == 0) {
            message.reply('No server found with that name.' + '\n' +
                'Use `-pop` to search for server with someone on it.' + '\n' +
                'Use `-nopop` to search for server with nobody on it.' + '\n' +
                'Use `-online` to search for only online servers.' + '\n' +
                'Use `-offline` to search for only online servers.' + '\n' +
                'Use `-map <map-number>` to specify the server map.' + '\n' +
                '   Available maps:' + '\n' +
                '```' + '\n' +
                '     ' + Array.from(battlemetrics_1.MAPS_NAME.keys()).map(e => `${e} - ${battlemetrics_1.MAPS_NAME.get(e)}`).join('\n     ') + '\n' +
                '```' + '\n' + '\n' +
                'Examples of valid queries:' + '\n' +
                '   `&scan r57 -online -pop`' + '\n' +
                '   `&scan d8 -map 1`' + '\n');
        }
        else if (onlines.length == 1 && servers.length == 1) {
            for await (let _ of await (0, battlemetrics_1.generateMessage)(onlines[0])[0])
                message.channel.send(_);
            for await (let i of [...Array(20).keys()]) {
                const res = await new Promise((resolve) => {
                    setTimeout(async () => {
                        const last = (await message.channel.messages.fetch({ limit: 1 })).first();
                        if (last.author.bot)
                            resolve(0);
                        if (last.content.includes('&id')) {
                            resolve(1);
                        }
                        else {
                            resolve(-1);
                        }
                    }, 2 * 1000);
                });
                if (res == -1)
                    break;
                if (res == 1) {
                    for await (let z of await (0, battlemetrics_1.generateMessage)(onlines[0], true)[0]) {
                        message.channel.send(z);
                    }
                }
            }
        }
        else {
            if (onlines.length > 10)
                servers = onlines;
            message.reply("  **The request need to be more specific or the server is offline. **" + '\n' +
                "      *La demande doit être plus précise ou le serveur est hors ligne.*" + '\n' +
                "```diff" + '\n' +
                servers.slice(0, 10).map((server) => `${server.attributes.status === 'online' ? '+' : '-'} ${servers.indexOf(server)} ${server.attributes.name} (${server.attributes.status === 'online' ? server.attributes.players + "/" + server.attributes.maxPlayers : "offline"})`).join('\n') +
                "```")
                .then(async (_) => {
                for await (let i of [...Array(20).keys()]) {
                    const res = await new Promise((resolve) => {
                        setTimeout(async () => {
                            const last = (await message.channel.messages.fetch({ limit: 1 })).first();
                            if (last.author.bot)
                                resolve(0);
                            if (new RegExp(/^[0-9]/g).test(last.content)) {
                                for await (let _ of await (0, battlemetrics_1.generateMessage)(servers[last.content])[0]) {
                                    message.channel.send(_);
                                    resolve(1);
                                }
                            }
                            else {
                                resolve(-1);
                            }
                        }, 0.5 * 1000);
                    });
                    if (res == -1)
                        break;
                    if (res == 1)
                        break;
                }
            });
        }
    }
    ;
}
exports.scan = scan;
