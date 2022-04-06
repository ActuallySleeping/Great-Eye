"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getCommands = async () => {
    let commands = [];
    const _hello = await Promise.resolve().then(() => require('../commands/hello'));
    commands.push(new _hello.hello);
    const _scan = await Promise.resolve().then(() => require('../commands/scan'));
    commands.push(new _scan.scan);
    return commands;
};
exports.default = getCommands;
