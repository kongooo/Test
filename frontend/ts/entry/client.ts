import '../../css/UI.scss';
import { SendName, chooseDis, WordShow, WordDis } from '../control/commit'
import { copyShow, joinDis, SendCode, codeError, successAct } from '../control/connect'
import { frameReady } from '../control/board'

let path = 'ws://' + window.location.host + '/ws/transfer';

let ws = new WebSocket(path);
ws.onopen = () => {
    console.log('client open!');
}

ws.onmessage = (mes) => {
    let val = JSON.parse(mes.data);

    switch (val.type) {

        case 'code':

            let code_val = val.code;
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
                successAct();
                frameReady();

            }

            break;
    }
}

ws.onerror = (err) => {
    console.log(err);
}

function send(mes: string) {
    ws.send(JSON.stringify({ 'data': mes }));
}

SendName(ws);
SendCode(ws);

document.querySelector('.host-btn').addEventListener('click', event => {
    ws.send(JSON.stringify({ 'type': 'host' }));
});

(window as any).send = send;


