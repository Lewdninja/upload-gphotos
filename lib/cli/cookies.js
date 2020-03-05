"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const tough_cookie_1 = require("tough-cookie");
function decodeCookie({ encoded, password, iv }) {
    try {
        const key = Buffer.from(crypto_1.default
            .createHash('sha256')
            .update(password, 'utf8')
            .digest('base64'), 'base64');
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
        const decoded = [decipher.update(encoded, 'base64', 'utf8'), decipher.final('utf8')].join('');
        return tough_cookie_1.CookieJar.fromJSON(decoded);
    }
    catch (err) {
        return new tough_cookie_1.CookieJar();
    }
}
exports.decodeCookie = decodeCookie;
function encodeCookie({ jar, password }) {
    const key = Buffer.from(crypto_1.default
        .createHash('sha256')
        .update(password, 'utf8')
        .digest('base64'), 'base64');
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    const cookie = JSON.stringify(jar.toJSON());
    const encoded = [cipher.update(cookie, 'utf8', 'base64'), cipher.final('base64')].join('');
    return { encoded, iv };
}
exports.encodeCookie = encodeCookie;
