"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getCommands = async () => {
    let commands = [];
    const _add = await Promise.resolve().then(() => require('../commands/add'));
    commands.push(new _add.add);
    const _scan = await Promise.resolve().then(() => require('../commands/scan'));
    commands.push(new _scan.scan);
    return commands;
};
exports.default = getCommands;
