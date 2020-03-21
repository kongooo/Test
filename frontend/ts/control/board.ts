export { init, frameReady }

let board_container = <HTMLDivElement>document.querySelector('.board-container'),
    frames = document.querySelectorAll('.frame'),
    frames_parent = <HTMLDivElement>document.querySelector('.frames'),
    pieces_board = <HTMLDivElement>document.querySelector('.pieces-board');
// signs = <HTMLDivElement>document.querySelector('.signs');

const grid_count = 18, ratio = 0.9, radius_rat = 0.85, margin_rat = 0.15;

let W = document.body.clientWidth, H = document.body.clientHeight;

let grid_width = ratio * H / grid_count;

let xScale = (W - (1 - ratio) * H) / grid_width, yScale = grid_count;
let xTrans = grid_width / 2 - 0.003 * xScale, yTrans = grid_width / 2 - 0.01 * yScale;
let xS = xScale - 1, yS = yScale - 1, xT = xTrans, yT = yTrans;

let timer = 0, timing = 2;

let go_count = (grid_count + 1) * (grid_count + 1);

function init() {
    board_container.style.display = 'none';
    frameChange();
    onFrameChange();
}

function initPieces() {
    for (let i = 0; i < go_count; i++) {
        let newGo = document.createElement('div');
        newGo.classList.add('go');
        let newGoBack = document.createElement('div');
        newGoBack.classList.add('go-back');
        newGoBack.appendChild(newGo);
        pieces_board.appendChild(newGoBack);
    }
}

function setBoardSize() {
    board_container.style.height = ratio * document.body.clientHeight + 'px';
    board_container.style.width = board_container.clientHeight + 'px';
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

function zoom() {
    let container = getDisContainer();
    let rat = 0;
    function zoomer() {
        timer += 0.01;
        if (timer >= timing) {
            onBoardChange();
            // signs.classList.add('signs-show');
            clearInterval(board_id);
            resetBoard();

            initPieces();

        }
        rat = (timing - timer) / timing;
        scaleBoard(rat)
        container.style.transform = 'scale(' + rat + ')';
        board_zoom(xS + 1, yS + 1, xT, yT);
    }
    let board_id = setInterval(zoomer, 10);
}



function board_zoom(xScale: number, yScale: number, xTrans: number, yTrans: number) {
    board_container.style.transform = 'scale(' + xScale + ',' + yScale + ') translate(' + xTrans + 'px, ' + yTrans + 'px)';
    board_container.style.backgroundImage = 'linear-gradient(to bottom, #595959, transparent ' + 1.5 * (1 / yScale) + 'px), ' + 'linear-gradient(to right, #595959, transparent ' + 1.5 * (1 / xScale) + 'px)';
}

