"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GetRandomNum(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function GetRandomLetter() {
    let index = GetRandomNum(0, 26);
    return String.fromCharCode(65 + index);
}
function GetRandomJudge() {
    let num = GetRandomNum(0, 2);
    if (num === 0)
        return false;
    else
        return true;
}
function GetRandomCode() {
    let code = GetRandomLetter();
    let time = new Date();
    let time_code = time.getTime().toString();
    let index = time_code.length;
    let length = GetRandomNum(10, 21) + index;
    for (let i = 0; i < length; i++) {
        if (GetRandomJudge())
            code += GetRandomLetter();
        else if (--index >= 0)
            code += time_code[index];
        if (i % 4 === 0)
            code += '-';
    }
    return code;
}
exports.GetRandomCode = GetRandomCode;
//# sourceMappingURL=RandomCode.js.map