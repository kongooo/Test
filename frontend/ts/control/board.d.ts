export { init, frameReady, editable, gos, updateCurrentPoint, setWebsocket, getCurrentPos, setRecon };
declare let editable: boolean[][];
declare let gos: HTMLDivElement[][];
declare function init(): void;
declare function setWebsocket(socket: WebSocket): void;
declare function setRecon(reconnect: any): void;
declare function updateCurrentPoint(x: number, y: number): void;
declare function getCurrentPos(): number[];
declare function frameReady(color: boolean): void;
