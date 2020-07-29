"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClientSocket_1 = require("./ClientSocket");
const path_1 = __importDefault(require("path"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_1 = __importDefault(require("koa"));
const app = new koa_1.default();
const websocket = require('koa-easy-ws');
const temp_path = path_1.default.join(__dirname, '../../dist');
const main = koa_static_1.default(temp_path);
const ws_route = new koa_router_1.default();
const main_route = new koa_router_1.default();
let clients = new Array(), connectMap = new Map(), hosterMap = new Map();
ws_route.get('/transfer', async function (ctx) {
    if (ctx.ws) {
        const ws = await ctx.ws();
        let client = new ClientSocket_1.Client(ws);
        client.Getws().on('message', async function (mes) {
            let val = JSON.parse(mes);
            switch (val.type) {
                case 'host':
                    let post_temp = new ClientSocket_1.Hoster(client.Getws());
                    post_temp.SetID(client.GetID());
                    try {
                        post_temp.Getws().send(JSON.stringify({ 'type': 'code', 'code': post_temp.GetCode() }));
                    }
                    catch (e) {
                        console.log(e);
                    }
                    hosterMap.set(post_temp.GetCode(), post_temp);
                    clients.splice(clients.indexOf(client), 1);
                    break;
                case 'id':
                    client.SetID(val.id);
                    break;
                case 'code':
                    if (hosterMap.has(val.code)) {
                        let hoster = hosterMap.get(val.code);
                        hosterMap.delete(val.code);
                        let joiner = client;
                        let connect = new ClientSocket_1.ClientSocket(hoster, joiner);
                        connectMap.set(hoster.GetCode(), connect);
                        setConnect(connect);
                        clients.splice(clients.indexOf(client), 1);
                        try {
                            hoster.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success', 'pcode': val.code }));
                            joiner.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success', 'pcode': val.code }));
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else {
                        try {
                            client.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'fail' }));
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    break;
                case 'reconnect':
                    if (connectMap.has(val.pcode)) {
                        let con = connectMap.get(val.pcode);
                        if (val.name === 'hoster') {
                            let hoster = new ClientSocket_1.Hoster(client.Getws());
                            hoster.SetID(con.GetPoster().GetID());
                            con.setPoster(hoster);
                        }
                        else if (val.name === 'joiner') {
                            let receiver = client;
                            receiver.SetID(con.GetReceiver().GetID());
                            con.setReceiver(receiver);
                        }
                        clients.splice(clients.indexOf(client), 1);
                        if (con.GetPoster().Getws().readyState === 1 && con.GetReceiver().Getws().readyState === 1) {
                            await setConnect(con);
                            con.GetPoster().Getws().send(JSON.stringify({ 'type': 'reconnect' }));
                            con.GetReceiver().Getws().send(JSON.stringify({ 'type': 'reconnect' }));
                        }
                    }
                    break;
            }
        });
        clients.push(client);
        clearClients();
        clearHosterMaps();
        clearConnectMaps();
    }
});
async function setConnect(connect) {
    let poster = connect.GetPoster(), receiver = connect.GetReceiver();
    setClient(poster, receiver);
    setClient(receiver, poster);
}
function setClient(poster, receiver) {
    poster.Getws().on('message', function (mes) {
        let state = receiver.Getws().readyState;
        console.log(poster.GetID() + ' to ' + receiver.GetID() + ': ' + mes);
        switch (JSON.parse(mes).type) {
            case 'data':
                let x = JSON.parse(mes).PointX, y = JSON.parse(mes).PointY;
                try {
                    if (state == 1) {
                        receiver.Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                    }
                    else
                        receiver.Getws().close();
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case 'ack':
                if (receiver.Getws().readyState === 1)
                    receiver.Getws().send(JSON.stringify({ 'type': 'ack' }));
                break;
        }
    });
    poster.Getws().on('close', function (e) {
        console.log(poster.GetID() + ' close');
    });
}
function clearHosterMaps() {
    hosterMap.forEach((v, k) => {
        if (v.Getws().readyState === 3)
            hosterMap.delete(k);
    });
}
function clearConnectMaps() {
    connectMap.forEach((v, k) => {
        let hoster = v.GetPoster().Getws(), receiver = v.GetReceiver().Getws();
        if (hoster.readyState === 3 && receiver.readyState === 3) {
            setTimeout(() => {
                connectMap.delete(k);
            }, 600000);
        }
    });
}
function clearClients() {
    let index = 0;
    clients.forEach(c => {
        if (c.Getws().readyState == 3)
            clients.splice(index, 1);
        index++;
    });
}
main_route.use('/ws', ws_route.routes(), ws_route.allowedMethods());
app.use(main)
    .use(koa_bodyparser_1.default())
    .use(websocket())
    .use(main_route.routes())
    .use(main_route.allowedMethods());
app.listen(3000);
//# sourceMappingURL=server.js.map