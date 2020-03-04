let content_div = document.querySelector('.content');
type HTTPMethods = 'GET'|'POST'|'PUT';

function myFetch(meth:HTTPMethods, url:string, data?:any) {
    return fetch(url, {
        method: meth,
        body: data,
        headers: data == undefined ? undefined : new Headers({
            'Content-type': "application/json"
        })
    }).then(response => response.text())
}

async function fib(n:number) {
    let p = await myFetch('GET', './func/fibPage?num=' + n, undefined);
    content_div.innerHTML = p;
}

async function count() {
    let p = await myFetch('GET', './func/timer');
    console.log('GET count: ' + p)
}

function GetJson(data:number) {
    return JSON.stringify({ num: data });
}

async function reset(n:number) {
    let p = await myFetch('PUT', './func/timer', GetJson(n));
    console.log('Reset count: ' + p);
}

let names = ['cxy', 'lyh', 'luffy', 'dw', 'sar', 'dir'];

function GetRandomInt(min:number, max:number) {
    return Math.round((Math.random() * (max - min) + min));
}

let ws = new WebSocket('ws://localhost:3000/ws/test');
ws.onopen = () => {
    console.log('client open!');
    let name = names[GetRandomInt(0, names.length)];
    ws.send('name=' + name);
    console.log('my name is ' + name);
    ws.send('hello server!');
}

ws.onmessage = (mes) => {
    console.log('receive from server: ' + mes.data);
}

function send(message:any) {
    ws.send(message);
}

(window as any).send=send;
(window as any).reset=reset;
(window as any).count=count;
(window as any).fib=fib;