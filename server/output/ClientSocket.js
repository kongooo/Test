"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = exports.Joiner = exports.Hoster = exports.Client = void 0;
const RandomCode_1 = require("./RandomCode");
class Client {
    constructor(ws) {
        this.ws = ws;
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