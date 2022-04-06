"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
const publ = require("../configs/public.json");
class hello {
    permissions = [];
    disabled = false;
    name = 'hello';
    guildOnly = true;
    args = false;
    cooldown = publ.cooldown.hello;
    aliases = ['h'];
    execute(message, args, client, localDB) {
        message.reply("World")
            .then(msg => {
            if (publ.cooldown.delete.hello > 0) {
                setTimeout(() => msg.delete().catch(e => { return; }), publ.cooldown.delete.hello * 1000);
            }
        });
    }
    ;
}
exports.hello = hello;
