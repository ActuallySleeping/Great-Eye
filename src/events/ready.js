"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cloudflare = require("axios-cloudflare");
exports.default = async (client) => {
    cloudflare(axios_1.default);
    console.log("Ready !");
    /*
    let response : any;

    let it : number[] = [];

    (() => {for (let i=1000;i<200000;i++){ it.push(i)}})();

    const instance = axios.create({
        baseURL : `https://api.battlemetrics.com/`,
        headers: {'Authorization': `Bearer ${priv.tokens.battlemetrics}`}
    });

    for await ( let i of it){
        try {

            response = await instance.get(`/servers/${i}`);
            
            console.log(i, response.data.data.relationships.game.data.id, response.data.data.attributes.name)

        
        } catch (e) {
            if ( e.response.headers['x-rate-limit-remaining'] <= 0){
                await new Promise(resolve => setTimeout(resolve, parseInt(e.response.headers['retry-after']) * 1050 ));
                i--;

            } else
                console.log(e.toString())
        }
    }*/
};
