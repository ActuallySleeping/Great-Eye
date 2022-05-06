"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repeat = async (client) => {
    const messageDAO = await Promise.resolve().then(() => require('../classes/messageDAO'));
    messageDAO.messageDAO.generate(client);
};
exports.default = repeat;
