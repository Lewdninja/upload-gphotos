"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = __importDefault(require("querystring"));
const axios_1 = __importDefault(require("axios"));
const tough_cookie_1 = require("tough-cookie");
const axios_cookiejar_support_1 = __importDefault(require("axios-cookiejar-support"));
const Nullable_1 = require("option-t/cjs/Nullable");
const constants_1 = require("./constants");
class Requestor {
    constructor() {
        this.atToken = null;
        this.axios = axios_1.default.create({
            headers: {
                'User-Agent': constants_1.USER_AGENT,
            },
            validateStatus: () => true,
            maxRedirects: 0,
            withCredentials: true,
            responseType: 'text',
            transformResponse: [(data) => data],
        });
        axios_cookiejar_support_1.default(this.axios);
        this.jar = new tough_cookie_1.CookieJar();
    }
    get jar() {
        return this.axios.defaults.jar;
    }
    set jar(jar) {
        this.axios.defaults.jar = jar;
    }
    async getAtToken() {
        if (Nullable_1.isNotNull(this.atToken)) {
            return this.atToken;
        }
        const { data, status } = await this.axios.get('https://photos.google.com');
        if (status !== 200) {
            throw new Error('Your sign in attempt has failed.');
        }
        const atTokenMatches = /"SNlM0e":"(.*?)"/.exec(data);
        if (Nullable_1.isNull(atTokenMatches)) {
            throw new Error('The token was not found.');
        }
        this.atToken = atTokenMatches[1];
        return this.atToken;
    }
    async sendBatchExecute({ queries, }) {
        const postData = Object.entries(queries).map(([key, value]) => [key, JSON.stringify(value), null, null]);
        const { data: rawData, status, statusText } = await this.axios.request({
            method: 'POST',
            url: 'https://photos.google.com/_/PhotosUi/data/batchexecute',
            data: querystring_1.default.stringify({
                'f.req': JSON.stringify([postData]),
                at: await this.getAtToken(),
            }),
        });
        if (status !== 200) {
            return Promise.reject(new Error(`${statusText}`));
        }
        const results = JSON.parse(rawData.substr(4)).filter(([firstValue]) => firstValue === 'wrb.fr');
        const error = results.find((entry) => Array.isArray(entry[entry.length - 2]));
        if (error !== undefined) {
            throw new Error(`Error batchexecute (error: ${error[error.length - 2][0]}, query: ${error[1]})`);
        }
        return results.reduce((obj, [, key, raw]) => Object.assign(obj, { [key]: JSON.parse(raw) }), {});
    }
    async upload({ stream, size, filename, }) {
        stream.pause();
        const serverStatusRes = await this.axios.post('https://photos.google.com/_/upload/uploadmedia/interactive', '', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-File-Name': encodeURIComponent(filename),
                'X-Goog-Upload-Raw-Size': size,
                'X-Goog-Upload-Header-Content-Length': size,
                'X-Goog-Upload-Protocol': 'resumable',
            },
        });
        if (serverStatusRes.status !== 200) {
            throw new Error(`Server Error: ${serverStatusRes.status}`);
        }
        const sendUrl = serverStatusRes.headers['x-goog-upload-url'];
        const resultRes = await this.axios.post(sendUrl, stream, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Goog-Upload-Command': 'upload, finalize',
                'X-Goog-Upload-File-Name': encodeURIComponent(filename),
                'X-Goog-Upload-Offset': 0,
            },
        });
        if (resultRes.headers['x-goog-upload-status'] !== 'final') {
            throw new Error('Failed to upload.');
        }
        const uploadToken = (() => {
            const str = Buffer.from(resultRes.data).toString();
            if (/^[A-Za-z0-9+/=]+$/.test(str)) {
                return str;
            }
            return Buffer.from(resultRes.data).toString('base64');
        })();
        const { mdpdU: [[[, photoInfoData]]], } = await this.sendBatchExecute({
            queries: {
                mdpdU: [[[uploadToken, filename, Date.now()]]],
            },
        });
        return photoInfoData;
    }
}
exports.Requestor = Requestor;
