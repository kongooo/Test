import { GetRandomCode } from './RandomCode'
export { Client, Hoster, Joiner, ClientSocket };


class Client {
    private ws: any;
    private id: string;
    constructor(ws: any) {
        this.ws = ws;
    }

    Getws() {
        return this.ws;
    }

    GetID() {
        return this.id;
    }

    SetID(id: string) {
        this.id = id;
    }
}

class Hoster extends Client {
    private code: string;
    constructor(ws: any) {
        super(ws);
        this.code = GetRandomCode();
    }

    GetCode() {
        return this.code;
    }
}

class Joiner extends Client {
    constructor(ws: any) {
        super(ws);
    }
}


class ClientSocket {
    private poster: Hoster;
    private receiver: Joiner;

    constructor(hs: Hoster, jn: Joiner) {
        this.poster = hs;
        this.receiver = jn;
    }

    GetPoster() {
        return this.poster;
    }

    GetReceiver() {
        return this.receiver;
    }

    setPoster(hoster: Hoster) {
        this.poster = hoster;
    }

    setReceiver(receiver: Joiner) {
        this.receiver = receiver;
    }
}


