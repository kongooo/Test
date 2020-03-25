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

                            let joiner = <Joiner>client;
                            let connect = new ClientSocket(hoster, joiner);

                            connect.GetPoster().Getws().on('message', function (mes: any) {
                                let state = connect.GetReceiver().Getws().readyState;
                                if (state == 1) {
                                    switch (JSON.parse(mes).type) {
                                        case 'data':
                                            let x = JSON.parse(mes).PointX,
                                                y = JSON.parse(mes).PointY;
                                            connect.GetReceiver().Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                                            break;
                                    }
                                }

                            });
                            connect.GetReceiver().Getws().on('message', function (mes: any) {
                                let state = connect.GetReceiver().Getws().readyState;
                                if (state == 1) {
                                    switch (JSON.parse(mes).type) {
                                        case 'data':
                                            let x = JSON.parse(mes).PointX,
                                                y = JSON.parse(mes).PointY;
                                            connect.GetPoster().Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                                            break;
                                    }
                                }

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
        clearClients();
        clearHosters();
        clearConnects();
    }
})

function clearConnects() {
    let index = 0;
    connects.forEach(c => {
        if (c.GetPoster().Getws().readyState == 3 || c.GetReceiver().Getws().readyState == 3)
            connects.splice(index, 1);
        index++;
    })
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
    .use(bodyParser())
    .use(websocket())
    .use(main_route.routes())
    .use(main_route.allowedMethods())

app.listen(3000)