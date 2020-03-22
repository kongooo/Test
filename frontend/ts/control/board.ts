export { init, frameReady }

let board_container = <HTMLDivElement>document.querySelector('.board-container'),
    frames = document.querySelectorAll('.frame'),
    frames_parent = <HTMLDivElement>document.querySelector('.frames'),
    pieces_board = <HTMLDivElement>document.querySelector('.pieces-board'),
    board_back_color = <HTMLDivElement>document.querySelector('.board-back-color'),
    keeps = document.querySelectorAll('.keep');
// signs = <HTMLDivElement>document.querySelector('.signs');

const grid_count = 18, ratio = 0.9, back_color_ratio = 963 / 1000;

let W = document.body.clientWidth, H = document.body.clientHeight;

let grid_width = ratio * H / grid_count;

let xScale = (W - (1 - ratio) * H) / grid_width, yScale = grid_count;
let xTrans = grid_width / 2 - 0.003 * xScale, yTrans = grid_width / 2 - 0.01 * yScale;
let xS = xScale - 1, yS = yScale - 1, xT = xTrans, yT = yTrans;

let timer = 0, timing = 2, scroll_speed = 0.01;

let signs: HTMLDivElement[] = [];

let scale_judge = true;

function init() {
    board_container.style.display = 'none';
    frameChange();
    onFrameChange();
}

function initPieces() {
    for (let y = 0; y < grid_count + 1; y++) {
        for (let x = 0; x < grid_count + 1; x++) {
            let newGo = document.createElement('div');
            newGo.classList.add('go');
            if (y == 3 || y == 9 || y == 15) {
                if (x == 3 || x == 9 || x == 15) {
                    newGo.classList.add('go-sign');
                    signs.push(newGo);
                }
            }
            let newGoBack = document.createElement('div');
            newGoBack.classList.add('go-back');
            newGoBack.appendChild(newGo);
            pieces_board.appendChild(newGoBack);
        }

    }
}


function setSize(proportion: number, box: HTMLDivElement) {
    if (document.body.clientWidth >= document.body.clientHeight) {
        box.style.height = proportion * document.body.clientHeight + 'px';
        box.style.width = box.clientHeight + 'px';
    }
    else {
        box.style.width = proportion * document.body.clientWidth + 'px';
        box.style.height = box.clientWidth + 'px';
    }
}

function updateKeeps() {
    let lr = (document.body.clientWidth - board_back_color.clientWidth - 4) / 2 + 'px';
    let tb = (document.body.clientHeight - board_back_color.clientHeight - 4) / 2 + 'px';
    (<HTMLDivElement>keeps[0]).style.height = tb;
    (<HTMLDivElement>keeps[1]).style.width = lr;
    (<HTMLDivElement>keeps[2]).style.width = lr;
    (<HTMLDivElement>keeps[3]).style.height = tb;
}

function setBoardSize() {
    setSize(ratio, board_container);
    setSize(back_color_ratio, board_back_color);
    updateKeeps();
    // if (document.body.clientHeight <= 414) {
    //     scale_judge = false;
    //     console.log('stop');
    //     DisKeeps();
    //     board_container.style.transform='scale(1)';
    // }
    // else {
    //     scale_judge = true;
    //     showKeeps();
    // }
}

function getLeftDis() {
    return (document.body.clientWidth - board_container.clientWidth) / 2;
}

function getTopDis() {
    return (document.body.clientHeight - board_container.clientHeight) / 2;
}

//before anima
function frameReady() {
    frames_parent.style.display = 'none';
    board_container.style.display = 'block';
    setBoardSize();
    updateFrame();
    board_zoom(xScale, yScale, xTrans, yTrans);
    zoom();
}

function frameChange() {
    updateClientSize();
    let distance = W * 0.025 + 'px';
    (<HTMLDivElement>frames[0]).style.left = distance;
    (<HTMLDivElement>frames[1]).style.top = distance;
    (<HTMLDivElement>frames[2]).style.right = distance;
    (<HTMLDivElement>frames[3]).style.bottom = distance;
}

function showKeeps() {
    keeps.forEach(k => {
        (<HTMLDivElement>k).style.display = 'block';
    });
}

function DisKeeps() {
    keeps.forEach(k => {
        (<HTMLDivElement>k).style.display = 'none';
    });
}

function onFrameChange() {
    window.onresize = frameChange;
}

//game start
function onBoardChange() {
    window.onresize = setBoardSize;
}

function updateClientSize() {
    W = document.body.clientWidth, H = document.body.clientHeight;
}

function updateGridSize() {
    updateClientSize();
    grid_width = ratio * H / grid_count;
}

function updateFrame() {
    updateGridSize();

    xScale = (W - (1 - ratio) * H) / grid_width, yScale = grid_count;
    xTrans = grid_width / 2 - 0.003 * xScale, yTrans = grid_width / 2 - 0.01 * yScale;
    xS = xScale - 1, yS = yScale - 1, xT = xTrans, yT = yTrans;
}

function getDisContainer() {
    let join_page = <HTMLDivElement>document.querySelector('.join-page'),
        host_page = <HTMLDivElement>document.querySelector('.host-page');
    if (join_page.style.display !== 'none') {
        return join_page;
    }
    if (host_page.style.display != 'none') {
        return host_page;
    }
}

function resetBoard() {
    xS = 1;
    yS = 1;
    xT = 0;
    yT = 0;
}

function scaleBoard(rat: number) {
    xS = (xScale - 1) * rat;
    yS = (yScale - 1) * rat;
    xT = (xTrans) * rat;
    yT = (yTrans) * rat;
}

function boardShow() {
    board_back_color.classList.add('board-back-color-show');

    signs.forEach(s => {
        s.classList.add('go-show');
    })
}

function zoom() {
    let container = getDisContainer();
    let rat = 0;
    function zoomer() {
        timer += 0.01;
        rat = (timing - timer) / timing;
        scaleBoard(rat)
        container.style.transform = 'scale(' + rat + ')';
        board_zoom(xS + 1, yS + 1, xT, yT);
        if (timer >= timing) {
            onBoardChange();
            // signs.classList.add('signs-show');
            clearInterval(board_id);
            resetBoard();

            initPieces();

            boardShow();
            showKeeps();
        }
    }
    let board_id = setInterval(zoomer, 10);
}

function board_zoom(xScale: number, yScale: number, xTrans: number, yTrans: number) {
    board_container.style.transform = 'scale(' + xScale + ',' + yScale + ') translate(' + xTrans + 'px, ' + yTrans + 'px)';
    board_container.style.backgroundImage = 'linear-gradient(to bottom, #595959, transparent ' + 1.5 * (1 / yScale) + 'px), ' + 'linear-gradient(to right, #595959, transparent ' + 1.5 * (1 / xScale) + 'px)';
}

let scale_rat = 1;

board_container.onwheel = e => {

    let origin_x = e.pageX - getLeftDis(),
        origin_y = e.pageY - getTopDis();

    if (origin_x <= 0) origin_x = 0;
    if (origin_x >= board_container.clientWidth) origin_x = board_container.clientWidth;

    if (origin_y <= 0) origin_y = 0;
    if (origin_y >= board_container.clientHeight) origin_y = board_container.clientHeight;

    if (e.deltaY < 0) {
        scale_rat = scale_rat >= 1.5 ? 1.5 : scale_rat + scroll_speed;
    }
    else {
        scale_rat = scale_rat <= 1 ? 1 : scale_rat - scroll_speed;
    }
    board_container.style.transformOrigin = origin_x + 'px ' + origin_y + 'px';
    board_container.style.transform = 'scale(' + scale_rat + ')';

}