export { init, frameReady, editable, gos, updateCurrentPoint };
declare let editable: boolean[][];
declare let gos: HTMLDivElement[][];
declare function init(): void;
declare function updateCurrentPoint(x: number, y: number): void;
declare function frameReady(ws: any, color: boolean): void;
