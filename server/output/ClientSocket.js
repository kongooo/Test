"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = exports.Joiner = exports.Hoster = exports.Client = void 0;
const RandomCode_1 = require("./RandomCode");
class Client {
    constructor(ws) {
        this.ws = ws;
        this.points = new Set();
    }
    Getws() {
        return this.ws;
    }
    GetID() {
        return this.id;
    }
    SetID(id) {
        this.id = id;
    }
    addPoint(x, y) {
        this.points.add(y * 9 + x);
    }
    findPoint(x, y) {
        return this.points.has(y * 9 + x);
    }
    deletePoint(x, y) {
        this.points.delete(y * 9 + x);
    }
    setPoints(p) {
        this.points = p;
    }
    getPoints() {
        return this.points;
    }
}
exports.Client = Client;
class Hoster extends Client {
    constructor(ws) {
        super(ws);
        this.code = RandomCode_1.GetRandomCode();
    }
    GetCode() {
        return this.code;
    }
}
exports.Hoster = Hoster;
class Joiner extends Client {
    constructor(ws) {
        super(ws);
    }
}
exports.Joiner = Joiner;
class ClientSocket {
    constructor(hs, jn) {
        this.poster = hs;
        this.receiver = jn;
    }
    GetPoster() {
        return this.poster;
    }
    GetReceiver() {
        return this.receiver;
    }
    setPoster(hoster) {
        this.poster = hoster;
    }
    setReceiver(receiver) {
        this.receiver = receiver;
    }
}
exports.ClientSocket = ClientSocket;
//# sourceMappingURL=ClientSocket.js.map