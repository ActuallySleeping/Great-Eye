"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands_1 = require("../handlers/commands");
const publ = require("../configs/public.json");
exports.default = async (client, message, cooldowns) => {
    if (message.author.bot)
        return;
    if ((message.channel instanceof discord_js_1.NewsChannel
        || message.channel instanceof discord_js_1.DMChannel)
        || !publ.channels.includes(message.channel.id)) {
        return;
    }
    let channel = message.channel;
    let commandName, args;
    commandName = message.content.substr(1).split(" ")[0].toLowerCase();
    args = message.content.split(" ").slice(1);
    const commands = await (0, commands_1.default)();
    const command = commands.find(c => c.name == commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));
    if (!command)
        return;
    if (command.disabled)
        return;
    if (command.cooldown) {
        cooldowns.set(command.name, new discord_js_1.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || publ.cooldown.default) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            return;
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try {
        if (command.guildOnly && message.channel instanceof discord_js_1.DMChannel) {
            channel.send('This command cannot be used inside DMs')
                .then(msg => { setTimeout(() => msg.delete().catch(() => { return; }), 4 * 1000); });
            return;
        }
        if (command.permissions && (message.channel instanceof discord_js_1.TextChannel || message.channel instanceof discord_js_1.GuildChannel || message.channel instanceof discord_js_1.ThreadChannel)) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                message.channel.send('You are missing the permissions to do it')
                    .then(msg => { setTimeout(() => msg.delete().catch(() => { return; }), 4 * 1000); });
                return;
            }
        }
        if (command.args && !args.length) {
            message.channel.send('You need to provide one/or more argument(s)')
                .then(msg => { setTimeout(() => msg.delete().catch(() => { return; }), 4 * 1000); });
            return;
        }
        command.execute(message, args.filter(n => { return n !== ''; }), client);
    }
    catch (err) {
        console.log(err);
    }
};
