"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = void 0;
const publ = require("../configs/public.json");
const messageDAO_1 = require("../classes/messageDAO");
class stop {
    permissions = [];
    disabled = false;
    name = 'stop';
    guildOnly = true;
    args = false;
    cooldown = publ.cooldown.default;
    aliases = [];
    async execute(message, args, client) {
        if (await messageDAO_1.messageDAO.delete(message.channel.id)) {
            message.channel.send("Stopped watching this channel!");
        }
        else {
            message.channel.send("I wasn't watching this channel!");
        }
    }
    ;
}
exports.stop = stop;
