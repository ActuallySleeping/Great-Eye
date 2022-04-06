"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = void 0;
const database_1 = require("../handlers/database");
const publ = require("../configs/public.json");
class add {
    permissions = [];
    disabled = false;
    name = 'add';
    guildOnly = true;
    args = true;
    cooldown = publ.cooldown.default;
    aliases = ['a'];
    execute(message, args, client) {
        if (args[0].length < 36) {
            message.reply("Player id is too short!");
            return;
        }
        if (args[0].length > 38) {
            message.reply("Player id is too long!");
            return;
        }
        // c154a524-b58f-11ec-90fc-68cb0d616a34
        // <c154a524-b58f-11ec-90fc-68cb0d616a34>
        if (!RegExp(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g).test(args[0])) {
            message.reply("Player id is not valid!");
            return;
        }
        args[0] = args[0].replaceAll(new RegExp(/[<>]/g), '');
        database_1.default.prisma.player.create({
            data: {
                id: args[0],
            },
        }).then(_ => {
            message.reply("Player added!");
        })
            .catch(e => {
            message.reply("Player already in the database!");
        });
    }
    ;
}
exports.add = add;
