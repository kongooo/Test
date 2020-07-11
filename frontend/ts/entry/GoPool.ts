export { Pool }

class Pool {
    private pool: number[];
    constructor() {
        this.pool = [-1, -1];
    }
    isEmpty() {
        return (this.pool[0] === -1 && this.pool[1] === -1)
    }
    updatePool(x: number, y: number) {
        this.pool = [x, y];
    }
    clearPool() {
        this.pool = [-1, -1];
    }
    isPoolEqual(x: number, y: number) {
        return (this.pool[0] === x && this.pool[1] === y)
    }
    sendData(ws: any) {
        if (this.pool[0] === -1 && this.pool[1] === -1) return;
        try {
            if (ws.readyState === 1)
                ws.send(JSON.stringify({ 'type': 'data', 'PointX': this.pool[0], 'PointY': this.pool[1] }));
            else ws.close();
        } catch (e) {
            console.log(e);
            ws.close();
        }
    }
}