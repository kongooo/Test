export { Client, Hoster, Joiner, ClientSocket };
declare class Client {
    private ws;
    private id;
    private points;
    private ack;
    constructor(ws: any);
    Getws(): any;
    GetID(): string;
    SetID(id: string): void;
    addPoint(x: number, y: number): void;
    findPoint(x: number, y: number): boolean;
    deletePoint(x: number, y: number): void;
    setPoints(p: Set<number>): void;
    getPoints(): Set<number>;
    setAck(a: boolean): void;
    getAck(): boolean;
}
declare class Hoster extends Client {
    private code;
    constructor(ws: any);
    GetCode(): string;
}
declare class Joiner extends Client {
    constructor(ws: any);
}
declare class ClientSocket {
    private poster;
    private receiver;
    constructor(hs: Hoster, jn: Joiner);
    GetPoster(): Hoster;
    GetReceiver(): Joiner;
    setPoster(hoster: Hoster): void;
    setReceiver(receiver: Joiner): void;
}
