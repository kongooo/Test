const Koa = require('koa');
const app = new Koa();
const path = require('path');
const serve = require('koa-static');
const router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const websocket = require('koa-easy-ws');
const temp_path = path.join(__dirname, '../dist');

const main = serve(temp_path);

let cache_array = [],
    cache_length = 0,
    temp = 10,
    count = 0;

const func_route = new router();
const ws_route = new router();
const main_route = new router();

function fib(n) {
    if (cache_array[n] == null) {
        for (let i = cache_length + 1; i <= n; i++) {
            if (i == 1 || i == 2) cache_array[i] = BigInt(1);
            else cache_array[i] = cache_array[i - 1] + cache_array[i - 2];
        }
    }
    cache_length = Math.max(n, cache_length);
    return cache_array[n];
}

func_route.get('/fibPage', async ctx => {
    ctx.response.type = 'html';
    temp = fib(ctx.query.num);
    ctx.response.body = 'fib is ' + temp;
}).get('/timer', async ctx => {
    ctx.response.type = 'text/plain';
    ctx.response.body = ++count;
}).put('/timer', async ctx => {
    ctx.response.type = 'text/plain';
    count = ctx.request.body.num;
    ctx.response.body = count;
})


let clients = [],
    client_names = []
i = 0;

ws_route.get('/test', async ctx => {
    if (ctx.ws) {
        const ws = await ctx.ws();
        clients[i++] = ws;
        let index = i - 1;
        console.log('server connect!');
        clients[index].send('hello client!');
        clients[index].on('message', mes => {
            console.log('receive from client: ' + mes);
            let id = mes.split('=')[1];
            if (id != null)
                client_names[index] = id;
            else {
                for (let j = 0; j < i; j++) {
                    clients[j].send(client_names[index] + "'s message: " + mes);
                }
            }

        })
    }
})

function sendDate(ws) {
    setInterval(() => {
        let date = new Date();
        ws.send(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
    }, 1000);
}

main_route.use('/func', func_route.routes(), func_route.allowedMethods())
    .use('/ws', ws_route.routes(), ws_route.allowedMethods());

app.use(main)
    .use(bodyParser())
    .use(websocket())
    .use(main_route.routes())
    .use(main_route.allowedMethods())

app.listen(3000)