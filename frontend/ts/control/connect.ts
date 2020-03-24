import { WordShow, WordDis, chooseDis } from './commit'

export { copyShow, joinDis, SendCode, codeError, successAct, sendHost };

let copy_text = <HTMLInputElement>document.querySelector('.code-copy'),
    code_span = <HTMLSpanElement>document.querySelector('.code-value'),
    invite_container = <HTMLElement>document.querySelector('.invite-text'),
    join_btn = document.querySelector('.code-btn'),
    copy_btn = <HTMLDivElement>document.querySelector('.copy'),
    code_send = <HTMLInputElement>document.querySelector('.code-send'),
    host_page = <HTMLDivElement>document.querySelector('.host-page'),
    hint = <HTMLSpanElement>document.querySelector('.hint'),
    join_page = <HTMLDivElement>document.querySelector('.join-page'),
    host_btn = <HTMLDivElement>document.querySelector('.host-btn');

const invite_text = 'please input your invite code';
const join_show_time = 30, join_dis_time = 50, host_dis_time = 50;

let code_judge = false;

join_btn.addEventListener('click', joinClick);

copy_btn.addEventListener('click', copy);

function joinClick() {
    chooseDis();
    code_send.classList.add('send-show');
    WordShow(invite_container, invite_text, join_show_time, null);
    host_page.style.display = 'none';
}

function copy() {
    copy_text.select();
    copy_text.setSelectionRange(0, copy_text.value.length);
    document.execCommand('copy');
}

function copyChange() {
    copy_text.value = code_span.innerHTML;
    code_span.style.display = 'none';
    copy_text.style.display = 'flex';
    copy_text.style.width = copy_text.scrollWidth + 'px';
}

function copyShow() {
    copy_btn.style.visibility = 'visible';
    copy_btn.classList.add('copy-shower');
    copyChange();
}

function joinDis() {
    join_page.style.display = 'none';
}

function hostDis() {
    host_page.style.display = 'none';
    copy_btn.style.pointerEvents = 'none';
    copy_btn.classList.remove('copy-shower');
}


function successAct() {
    if (join_page.style.display !== 'none') {
        code_judge = true;
        code_send.classList.add('send-dis');
        WordDis(invite_container, join_dis_time, joinDis);

        (<HTMLDivElement>document.querySelector('.keep-out')).style.zIndex = '2';

        return false;
    }
    if (host_page.style.display != 'none') {

        code_span.style.display = 'flex';
        copy_text.style.display = 'none';

        WordDis(code_span, host_dis_time, hostDis);

        (<HTMLDivElement>document.querySelector('.keep-out')).style.zIndex = '0';
        return true;
    }
}

function sendHost(ws: any) {
    host_btn.addEventListener('click', () => {
        ws.send(JSON.stringify({ 'type': 'host' }));
    })
}

function SendCode(ws: any) {

    code_send.onfocus = function () {

        document.onkeydown = function (e) {

            if (e.code == "Enter") {
                if (code_send.value.length < 1) {
                    invite_container.style.color = "red";
                    setTimeout(() => {
                        invite_container.style.color = "#595959";
                    }, 100);
                }
                else if (!code_judge) {
                    ws.send(JSON.stringify({ 'type': 'code', 'code': code_send.value }));
                }
            }
        }
    }
}

function codeError() {
    hint.classList.add('hint-show');
    setTimeout(() => {
        hint.classList.remove('hint-show');
    }, 1000);
}