export { setWs, SendName, word_content, chooseDis, WordShow, WordDis };

const home_word = "please input your name";

let name_input = <HTMLInputElement>document.querySelector('.id-input'),
    word_content = <HTMLElement>document.querySelector('.name-text'),
    start_page = <HTMLDivElement>document.querySelector('.homepage'),
    choose_page = <HTMLDivElement>document.querySelector('.choose');

let send_judge = false;
const name_show_time = 50, name_dis_time = 40;

let ws: any;

function setWs(w: any) {
    ws = w;
}

function setShowDis() {
    choose_page.style.bottom = document.body.clientHeight / 2 + 100 + 'px';
}

function WordShow(container: any, content: string, interval: number, action: () => void) {
    let index = 0;
    function show() {
        if (index < content.length) {
            container.innerHTML += content[index++];
            show_id = setTimeout(show, interval);
        } else {
            clearTimeout(show_id);
            if (action != null)
                action();
        }
    }

    let show_id = setTimeout(show, 0);
}

function WordDis(container: any, interval: number, action: () => void) {
    let word = container.innerHTML;
    let index = word.length;
    function disappear() {
        if (index > 0) {
            container.innerHTML = word.slice(0, --index);
            setTimeout(disappear, interval);
        } else {
            clearTimeout(dis);
            action();
        }
    }
    let dis = setTimeout(disappear, 0);
}

function wordDisAct() {
    start_page.style.display = 'none';
}


function SendName() {

    name_input.onfocus = function () {

        document.onkeydown = function (e) {

            if (e.code == "Enter") {
                send();
            }
        }
    }

    document.querySelector('.name-send-btn').addEventListener('click', send);
}

function send() {
    if (name_input.value.length < 1) {
        word_content.style.color = "#e78c8c";
        setTimeout(() => {
            word_content.style.color = "#595959";
        }, 100);
    }
    else if (!send_judge) {
        setShowDis();
        send_judge = true;
        ws.send(JSON.stringify({ 'type': 'id', 'id': name_input.value }));

        WordDis(word_content, name_dis_time, wordDisAct);

        name_input.classList.add('input-dis');

        setTimeout(() => {
            choose_page.classList.add('choose-show');
        }, 1);
    }
}

function chooseDis() {
    choose_page.classList.add('choose-dis');
    setTimeout(() => {
        choose_page.style.display = 'none';
    }, 700);
}


WordShow(word_content, home_word, name_show_time, null);
