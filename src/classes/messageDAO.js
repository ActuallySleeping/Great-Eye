"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageDAO = void 0;
const discord_js_1 = require("discord.js");
const database_1 = require("../database");
const battlemetrics_1 = require("./battlemetrics");
class messageDAO {
    static async save(message, message_id, server_id) {
        await database_1.default.prisma.message.create({
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
    static async delete(channel_id) {
        let m = await messageDAO.get(channel_id);
        if (!m)
            return false;
        await database_1.default.prisma.message.delete({
            where: {
                channel_id: channel_id,
            },
        });
        return true;
    }
    static async get(channel_id) {
        return await database_1.default.prisma.message.findUnique({
            where: {
                channel_id: channel_id,
            },
        });
    }
    static async getAll() {
        return await database_1.default.prisma.message.findMany();
    }
    static async generate(client) {
        console.log('Loading messages...');
        const Channels = await this.getAll();
        for (const Channel of Channels) {
            client.channels.fetch(Channel.channel_id).then(async (channel) => {
                if (channel instanceof discord_js_1.TextChannel || channel instanceof discord_js_1.ThreadChannel) {
                    this.updateChannel(channel);
                }
            });
        }
    }
    static updateChannel(channel) {
        let players = undefined;
        setInterval(async () => {
            const serverInfos = await messageDAO.get(channel.id);
            if (serverInfos == null)
                return;
            const server = await (0, battlemetrics_1.getServer)(serverInfos.server_id);
            const messages = await channel.messages.fetch({ limit: 100 });
            for await (let message of messages) {
                message[1].delete().catch(() => { });
            }
            const infos = await (0, battlemetrics_1.generateMessage)(server.data.data);
            for await (let _ of infos[0]) {
                channel.send(_);
            }
            if (!players)
                players = Object.values(infos[1]);
            else {
                const currentPlayers = Object.values(infos[1]);
                for await (let _ of currentPlayers) {
                    if (!players.map((e) => e.id).includes(_.id)) {
                        console.log(`${_.name} has joined the server`);
                    }
                }
                for await (let _ of players) {
                    if (!currentPlayers.map((e) => e.id).includes(_.id)) {
                        console.log(`${_.name} has left the server`);
                    }
                }
                players = currentPlayers;
            }
        }, 1 * 30 * 1000);
    }
}
exports.messageDAO = messageDAO;
