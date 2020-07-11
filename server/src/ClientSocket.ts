import { GetRandomCode } from './RandomCode'
export { Client, Hoster, Joiner, ClientSocket };


class Client {
    private ws: any;
    private id: string;
    private points: Set<number>;
    private ack: boolean;
    constructor(ws: any) {
        this.ws = ws;
        this.points = new Set();
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

    addPoint(x: number, y: number) {
        this.points.add(y * 9 + x);
    }

    findPoint(x: number, y: number) {
        return this.points.has(y * 9 + x);
    }

    deletePoint(x: number, y: number) {
        this.points.delete(y * 9 + x);
    }

    setPoints(p: Set<number>) {
        this.points = p;
    }

    getPoints() {
        return this.points;
    }

    setAck(a: boolean) {
        this.ack = a;
    }

    getAck() {
        return this.ack;
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


