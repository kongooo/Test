import '../../css/UI.scss';
import { SendName, chooseDis, WordShow } from '../control/commit'
import { copyShow, joinDis, SendCode, codeError, successAct, sendHost } from '../control/connect'
import { frameReady, editable, gos, updateCurrentPoint, init, setWebsocket, getCurrentPos, setRecon } from '../control/board'

let path = 'ws://' + window.location.host + '/ws/transfer';

let ws = new WebSocket(path);
let color: boolean;
let code_val: string;
let type = 'joiner';

ws.onmessage = (mes) => {
    let val = JSON.parse(mes.data);
    switch (val.type) {

        case 'code':

            type = 'hoster';
            code_val = val.code;
            let code_container = <HTMLSpanElement>document.querySelector('.code-value');

            WordShow(code_container, code_val, 30, copyShow);

            chooseDis();

            joinDis();

            break;

        case 'connect':

            if (val.connect == 'fail') {
                codeError();
            }
            else if (val.connect == 'success') {
                setWebsocket(ws);
                setRecon(reconnect);
                color = successAct();
                frameReady(color);
                code_val = val.pcode;
                heartCheck.start();
            }

            break;

        case 'data':
            let x = val.PointX, y = val.PointY;
            editable[y][x] = false;

            if (!color) {
                //black
                gos[y][x].style.backgroundColor = '#414141';
            }
            else {
                //white
                gos[y][x].style.backgroundColor = 'white';
                gos[y][x].style.border = '1px solid #414141';
            }
            updateCurrentPoint(x, y);
            (<HTMLDivElement>document.querySelector('.keep-out')).style.zIndex = '0';
            sendFunc(JSON.stringify({ 'type': 'ack' }));

            break;
        case 'pong':
            heartCheck.reset();
            // console.log('pong');
            break;
    }
}

function reconnect() {
    console.log('reconnect type: ' + type);
    try {
        ws = new WebSocket(path);
    } catch (e) {
        console.log(e);
        ws.close();
    }
    if (ws.readyState === 2 || ws.readyState === 3) { ws.close(); return; }
    setWebsocket(ws);
    ws.onmessage = (mes) => {
        let val = JSON.parse(mes.data);
        heartCheck.reset();
        switch (val.type) {
            case 'data':
                let x = val.PointX, y = val.PointY;
                editable[y][x] = false;

                if (!color) {
                    //black
                    gos[y][x].style.backgroundColor = '#414141';
                }
                else {
                    //white
                    gos[y][x].style.backgroundColor = 'white';
                    gos[y][x].style.border = '1px solid #414141';
                }
                updateCurrentPoint(x, y);
                (<HTMLDivElement>document.querySelector('.keep-out')).style.zIndex = '0';
                sendFunc(JSON.stringify({ 'type': 'ack' }));
                break;
            case 'again':
                sendFunc(JSON.stringify({ 'type': 'data', 'PointX': getCurrentPos()[0], 'PointY': getCurrentPos()[1] }));
                break;
            case 'reconnect':
                sendFunc(JSON.stringify({ 'type': 'data', 'PointX': getCurrentPos()[0], 'PointY': getCurrentPos()[1] }))
                break;
        }
    }
    ws.onclose = e => {
        closeAct();
    }

    ws.onerror = (err) => {
        console.log(err);
        ws.close();
    }

    ws.onopen = e => {
        sendFunc(JSON.stringify({ 'type': 'reconnect', 'pcode': code_val, 'name': type }))
    }
}

ws.onerror = (err) => {
    console.log(err);
    ws.close();
}

ws.onopen = e => {

}

ws.onclose = e => {
    closeAct();
}

function closeAct() {
    reconnect();
}

function close() {
    ws.close();
}

function sendFunc(data: string) {
    try {
        if (ws.readyState === 1)
            ws.send(data);
        else ws.close();
    } catch (e) {
        console.log(e);
        ws.close();
    }
}

init();
SendName(ws);
SendCode(ws);
sendHost(ws);

(window as any).close = close;
(window as any).reconnect = reconnect;

let heartCheck = {
    interval: 1000,
    timeOut: 5000,
    checkObj: setTimeout(() => { }, 10),
    returnObj: setTimeout(() => { }, 10),
    start: function () {
        this.checkObj = setTimeout(() => {
            ws.send(JSON.stringify({ 'type': 'ping' }));
            this.returnObj = setTimeout(() => {
                ws.close();
            }, this.timeOut);
        }, this.interval)
    },
    reset: function () {
        clearTimeout(this.checkObj);
        clearTimeout(this.returnObj);
        this.start();
    }
}




