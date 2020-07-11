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

let clients: Client[] = new Array(), connects: ClientSocket[] = new Array(), connectMap = new Map(), hosterMap = new Map();

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
                    try {
                        post_temp.Getws().send(JSON.stringify({ 'type': 'code', 'code': post_temp.GetCode() }));
                    } catch (e) {
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

                        let joiner = <Joiner>client;
                        let connect = new ClientSocket(hoster, joiner);

                        connectMap.set(hoster.GetCode(), connect);

                        setConnect(connect);

                        connects.push(connect);

                        clients.splice(clients.indexOf(client), 1);

                        try {
                            hoster.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success', 'pcode': val.code }));
                            joiner.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'success', 'pcode': val.code }));
                        } catch (e) {
                            console.log(e);
                        }

                    } else {
                        try {
                            client.Getws().send(JSON.stringify({ 'type': 'connect', 'connect': 'fail' }));
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    break;

                case 'reconnect':
                    if (connectMap.has(val.pcode)) {
                        let con = connectMap.get(val.pcode);
                        if (val.name === 'hoster') {
                            let hoster = new Hoster(client.Getws());
                            hoster.setPoints(con.GetPoster().getPoints());
                            con.setPoster(hoster);
                        }
                        else if (val.name === 'joiner') {
                            let receiver = <Joiner>client;
                            receiver.setPoints(con.GetReceiver().getPoints());
                            con.setReceiver(receiver);
                        }

                        clients.splice(clients.indexOf(client), 1);

                        if (con.GetPoster().Getws().readyState === 1 && con.GetReceiver().Getws().readyState === 1) {
                            setConnect(con);
                            con.GetPoster().Getws().send(JSON.stringify({ 'type': 'reconnect' }));
                            con.GetReceiver().Getws().send(JSON.stringify({ 'type': 'reconnect' }));
                        }
                    }
                    break;
            }
        });

        clients.push(client);
        clearClients();
        clearConnects();
        clearHosterMaps();
        clearConnectMaps();
    }
})

function setConnect(connect: ClientSocket) {
    let poster = connect.GetPoster(), receiver = connect.GetReceiver();
    setClient(poster, receiver);
    setClient(receiver, poster);
}

function setClient(poster: any, receiver: any) {
    poster.Getws().on('message', function (mes: any) {
        let state = receiver.Getws().readyState;
        console.log(poster.GetID() + ' to ' + receiver.GetID() + ': ' + mes);
        switch (JSON.parse(mes).type) {
            case 'data':
                let x = JSON.parse(mes).PointX,
                    y = JSON.parse(mes).PointY;
                try {
                    if (state == 1) {
                        receiver.Getws().send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                    } else receiver.Getws().close();
                } catch (e) {
                    console.log(e);
                }
                break;
            // case 'ping':
            //     try {
            //         if (state == 1) {
            //             receiver.Getws().send(JSON.stringify({ 'type': 'pong' }));
            //         }
            //     } catch (e) {
            //         console.log(e);
            //     }
            //     break;
            case 'ack':
                if (receiver.Getws().readyState === 1)
                    receiver.Getws().send(JSON.stringify({ 'type': 'ack' }));
                break;
        }
    });

    poster.Getws().on('close', function (e: any) {
        // console.log('poster close');
    });
}

function clearHosterMaps() {
    hosterMap.forEach((v, k) => {
        if (v.Getws().readyState === 3) hosterMap.delete(k);
    })
}

function clearConnectMaps() {
    connectMap.forEach((v, k) => {
        let hoster = v.GetPoster().Getws(), receiver = v.GetReceiver().Getws();
        if (hoster.readyState === 3 && receiver.readyState === 3) {
            setTimeout(() => {
                connectMap.delete(k);
            }, 600000);
        }
    })
}

function clearConnects() {
    let index = 0;
    connects.forEach(c => {
        if (c.GetPoster().Getws().readyState == 3 || c.GetReceiver().Getws().readyState == 3)
            connects.splice(index, 1);
        index++;
    })
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