"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const Undefinable_1 = require("option-t/cjs/Undefinable");
const Maybe_1 = require("option-t/cjs/Maybe");
const GPhotosPhoto_1 = require("./GPhotosPhoto");
class GPhotosAlbum {
    constructor(info, { requestor }) {
        this.id = info.id;
        this.info = info;
        this.requestor = requestor;
    }
    static parseInfo(data) {
        const info = data.pop()['72930366'];
        return {
            id: data.shift(),
            type: 'album',
            title: info[1],
            period: {
                from: new Date(info[2][0]),
                to: new Date(info[2][1]),
            },
            itemsCount: info[3],
            isShared: info[4] === true,
        };
    }
    async getInfo({ force } = { force: false }) {
        if (!force && Undefinable_1.isNotUndefined(this.info.title)) {
            return this.info;
        }
        const { snAcKc: [, , , info], } = await this.requestor.sendBatchExecute({
            queries: {
                snAcKc: [this.id, null, null, null, 0],
            },
        });
        const parsedInfo = {
            id: this.id,
            type: 'album',
            title: info[1],
            period: {
                from: new Date(info[2][0]),
                to: new Date(info[2][1]),
            },
            itemsCount: info[21],
            isShared: info[8] === true,
        };
        this.info = parsedInfo;
        return parsedInfo;
    }
    async append(...photoList) {
        if (this.info.isShared) {
            await this.requestor.sendBatchExecute({
                queries: {
                    C2V01c: [[this.id], [2, null, [[photoList.map((p) => p.id)]], null, null, [], [1], null, null, null, []]],
                },
            });
        }
        else {
            await this.requestor.sendBatchExecute({
                queries: {
                    E1Cajb: [photoList.map((p) => p.id), this.id],
                },
            });
        }
    }
    async remove(photo) {
        await this.requestor.sendBatchExecute({
            queries: { ycV3Nd: [[photo.id], []] },
        });
    }
    async fetchPhotoList({ cursor, }) {
        const { snAcKc: [, photoInfoList, nextCursor], } = await this.requestor.sendBatchExecute({
            queries: {
                snAcKc: [this.id, cursor, null, null, 0],
            },
        });
        const photoList = photoInfoList.map((info) => {
            return new GPhotosPhoto_1.GPhotosPhoto(GPhotosPhoto_1.GPhotosPhoto.parseInfo(info), { requestor: this.requestor });
        });
        // NOTE: Cursor maybe undefined or null or empty string.
        if (Maybe_1.isNullOrUndefined(nextCursor) || nextCursor === '') {
            return { results: photoList, nextCursor: null };
        }
        return { results: photoList, nextCursor };
    }
    async delete() {
        await this.requestor.sendBatchExecute({
            queries: { nV6Qv: [[this.id], []] },
        });
    }
    toJSON() {
        return this.info;
    }
    toString() {
        return `GPhotosAlbum<${JSON.stringify(this.info, null, 2)}>`;
    }
    [util_1.default.inspect.custom]() {
        return this.toString();
    }
}
exports.GPhotosAlbum = GPhotosAlbum;
