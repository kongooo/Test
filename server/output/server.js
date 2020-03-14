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
                                let data = JSON.parse(mes).data;
                                connect.GetReceiver().Getws().send(data);
                            });
                            connect.GetReceiver().Getws().on('message', function (mes) {
                                let data = JSON.parse(mes).data;
                                connect.GetPoster().Getws().send(data);
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
    }
});
main_route.use('/ws', ws_route.routes(), ws_route.allowedMethods());
app.use(main)
    .use(koa_bodyparser_1.default())
    .use(websocket())
    .use(main_route.routes())
    .use(main_route.allowedMethods());
app.listen(3000);
//# sourceMappingURL=server.js.map