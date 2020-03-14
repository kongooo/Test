export { SendName, word_content, chooseDis, WordShow, WordDis };

const home_word = "please input your name";

let name_input = <HTMLInputElement>document.querySelector('.id-input'),
    word_content = <HTMLElement>document.querySelector('.name-text'),
    start_page = <HTMLDivElement>document.querySelector('.homepage'),
    choose_page = <HTMLDivElement>document.querySelector('.choose');

let move_distance = document.body.clientHeight / 2 + 100;
let send_judge = false;

function WordShow(container: any, content: string, interval: number, action: () => void) {
    let index = 0;
    function show() {
        if (index < content.length) {
            container.innerHTML += content[index++];
            setTimeout(show, interval);
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


function SendName(ws: any) {

    name_input.onfocus = function () {

        document.onkeydown = function (e) {

            if (e.code == "Enter") {
                if (name_input.value.length < 1) {
                    word_content.style.color = "#e78c8c";
                    setTimeout(() => {
                        word_content.style.color = "#595959";
                    }, 100);
                }
                else if (!send_judge) {
                    send_judge = true;
                    ws.send(JSON.stringify({ 'type': 'id', 'id': name_input.value }));

                    WordDis(word_content, 50, wordDisAct);

                    name_input.classList.add('input-dis');
                    choose_page.classList.add('choose-show');
                }
            }
        }
    }
}

function chooseDis(){
    choose_page.classList.add('choose-dis');
    setTimeout(() => {
        choose_page.style.display='none';
    }, 700);
}


WordShow(word_content, home_word, 50, null);
choose_page.style.bottom = move_distance + 'px';