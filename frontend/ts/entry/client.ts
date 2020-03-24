import '../../css/UI.scss';
import { SendName, chooseDis, WordShow} from '../control/commit'
import { copyShow, joinDis, SendCode, codeError, successAct, sendHost } from '../control/connect'
import { frameReady, editable, gos, updateCurrentPoint, init } from '../control/board'

let path = 'wss://' + window.location.host + '/ws/transfer';

let ws = new WebSocket(path);
let color: boolean;

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
                color = successAct();
                frameReady(ws, color);
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

            break;
    }
}

ws.onerror = (err) => {
    console.log(err);
}

init();
SendName(ws);
SendCode(ws);
sendHost(ws);




