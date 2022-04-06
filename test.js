const fs = require('fs');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const httpGetAsync = (url, callback) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

const url = 'https://www.battlemetrics.com/servers/ark/563595'

httpGetAsync(url, (res) => {
    res = res.split('<script id="storeBootstrap" type="application/json">')[1].split('</script>')[0]

    res = JSON.parse(res)

    const requested = "563595"
    const server = res.state.servers.servers[requested]
    const players = res.state.sessions.sessions

    for ( let id in players){
        const player = players[id];

        
    }

    //fs.writeFileSync('players.json', JSON.stringify(players));
    //fs.writeFileSync('server.json', JSON.stringify(server));
})



