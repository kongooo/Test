import { Client, Hoster, Joiner, ClientSocket } from './ClientSocket'

import path from 'path';
import serve from 'koa-static';
import router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';

const app = new Koa();
const websocket = require('koa-easy-ws');

const temp_path = path.join(__dirname, '../../dist');

const main = serve(temp_path);

const ws_route = new router();
const main_route = new router();

let clients: Client[] = new Array(), hosters: Hoster[] = new Array(), connects: ClientSocket[] = new Array();

ws_route.get('/transfer', async function (ctx: any) {
    if (ctx.ws) {

        const ws = await ctx.ws();

        let client = new Client(ws);

        client.Getws().on('message', function (mes: any) {

            let val = JSON.parse(mes);

            switch (val.type) {

                case 'host':
                    let post_temp = new Hoster(client.Getws());
                    post_temp.SetID(client.GetID());
                    hosters.push(post_temp);
                    post_temp.Getws().send(JSON.stringify({ 'type': 'code', 'code': post_temp.GetCode()}));
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

                            let joiner = <Joiner>client;
                            let connect = new ClientSocket(hoster, joiner);

                            connect.GetPoster().Getws().on('message', function (mes: any) {
                                let data = JSON.parse(mes).data;
                                connect.GetReceiver().Getws().send(data);
                            });
                            connect.GetReceiver().Getws().on('message', function (mes: any) {
                                let data = JSON.parse(mes).data;
                                connect.GetPoster().Getws().send(data);
                            })

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
})

main_route.use('/ws', ws_route.routes(), ws_route.allowedMethods());

app.use(main)
    .use(bodyParser())
    .use(websocket())
    .use(main_route.routes())
    .use(main_route.allowedMethods())

app.listen(3000)