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
let clients = new Array(), hosters = new Array(), connects = new Array();
ws_route.get('/transfer', async function (ctx) {
    if (ctx.ws) {
        const ws = await ctx.ws();
        let client = new ClientSocket_1.Client(ws);
        client.Getws().on('message', function (mes) {
            let val = JSON.parse(mes);
            switch (val.type) {
                case 'host':
                    let post_temp = new ClientSocket_1.Hoster(client.Getws());
                    post_temp.SetID(client.GetID());
                    hosters.push(post_temp);
                    post_temp.Getws().send(JSON.stringify({ 'type': 'code', 'code': post_temp.GetCode() }));
                    clients.splice(clients.indexOf(client), 1);
                    break;
                case 'id':
                    client.SetID(val.id);
                    break;
                case 'code':
                    let exist = false;
                    hosters.forEach(hoster => {
                        if (hoster.GetCode() == val.code) {
                            exist = true;
                            let joiner = client;
                            let connect = new ClientSocket_1.ClientSocket(hoster, joiner);
                            connect.GetPoster().Getws().on('message', function (mes) {
                                let state = connect.GetReceiver().Getws().readyState;
                                if (state == 1) {
                                    switch (JSON.parse(mes).type) {
                                        case 'data':
                                            let x = JSON.parse(mes).PointX, y = JSON.parse(mes).PointY;
                                            connect.GetReceiver().Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                                            break;
                                    }
                                }
                            });
                            connect.GetReceiver().Getws().on('message', function (mes) {
                                let state = connect.GetReceiver().Getws().readyState;
                                if (state == 1) {
                                    switch (JSON.parse(mes).type) {
                                        case 'data':
                                            let x = JSON.parse(mes).PointX, y = JSON.parse(mes).PointY;
                                            connect.GetPoster().Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                                            break;
                                    }
                                }
                            });
                            connects.push(connect);
                            hosters.splice(hosters.indexOf(hoster), 1);
                            clients.splice(clients.indexOf(client), 1);
                            hoster.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success' }));
                            joiner.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success' }));
                        }
                    });
                    if (!exist) {
                        client.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'fail' }));
                    }
                    break;
            }
        });
        clients.push(client);
        clearClients();
        clearHosters();
        clearConnects();
    }
});
function clearConnects() {
    let index = 0;
    connects.forEach(c => {
        if (c.GetPoster().Getws().readyState == 3 || c.GetReceiver().Getws().readyState == 3)
            connects.splice(index, 1);
        index++;
    });
}
function clearHosters() {
    let index = 0;
    hosters.forEach(c => {
        if (c.Getws().readyState == 3)
            hosters.splice(index, 1);
        index++;
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