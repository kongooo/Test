export { Pool };
declare class Pool {
    private pool;
    constructor();
    isEmpty(): boolean;
    updatePool(x: number, y: number): void;
    clearPool(): void;
    isPoolEqual(x: number, y: number): boolean;
    sendData(ws: any): void;
}
