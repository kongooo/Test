export { Client, Hoster, Joiner, ClientSocket };
declare class Client {
    private ws;
    private id;
    constructor(ws: any);
    Getws(): any;
    GetID(): string;
    SetID(id: string): void;
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
}
