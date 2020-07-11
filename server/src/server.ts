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
                        if (val.name === 'hoster')
                            con.setPoster(new Hoster(client.Getws()));
                        else if (val.name === 'joiner')
                            con.setReceiver(<Joiner>client);

                        clients.splice(clients.indexOf(client), 1);

                        if (con.GetPoster().Getws().readyState === 1 && con.GetReceiver().Getws().readyState === 1) {
                            setConnect(con);
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
    let poster = connect.GetPoster().Getws(), receiver = connect.GetReceiver().Getws();
    poster.on('message', function (mes: any) {
        let state = receiver.readyState;
        switch (JSON.parse(mes).type) {
            case 'data':
                let x = JSON.parse(mes).PointX,
                    y = JSON.parse(mes).PointY;
                try {
                    if (state == 1)
                        receiver.send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                    // else
                    //     poster.close();
                } catch (e) {
                    console.log(e);
                }
                break;
        }
    });

    receiver.on('close', function (e: any) {
        console.log('poster close');
    });


    receiver.on('message', function (mes: any) {
        let state = poster.readyState;
        switch (JSON.parse(mes).type) {
            case 'data':
                let x = JSON.parse(mes).PointX,
                    y = JSON.parse(mes).PointY;
                try {
                    if (state == 1)
                        poster.send(JSON.stringify({ 'type': 'data', 'PointX': x, 'PointY': y }));
                    // else
                    //     receiver.close();
                } catch (e) {
                    console.log(e);
                }
                break;
        }
    })

    receiver.on('close', function (e: any) {
        console.log('receiver close');
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
            }, 3600000);
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