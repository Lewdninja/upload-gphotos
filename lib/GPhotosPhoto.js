"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const Undefinable_1 = require("option-t/cjs/Undefinable");
class GPhotosPhoto {
    constructor(info, { requestor }) {
        this.id = info.id;
        this.info = info;
        this.requestor = requestor;
    }
    static parseInfo(data) {
        const lastIdx = data.length - 1;
        const type = !data[lastIdx] || typeof data[lastIdx] !== 'object'
            ? 'photo'
            : '76647426' in data[lastIdx]
                ? 'video'
                : '139842850' in data[lastIdx]
                    ? 'animation_gif'
                    : 'photo';
        return {
            type,
            id: data[0],
            createdAt: new Date(data[2]),
            uploadedAt: new Date(data[5]),
            duration: type === 'video' ? data[lastIdx]['76647426'][0] : undefined,
            width: type === 'video' ? data[lastIdx]['76647426'][2] : data[1][1],
            height: type === 'video' ? data[lastIdx]['76647426'][3] : data[1][2],
            rawUrl: data[1][0],
        };
    }
    async getInfo({ force } = { force: false }) {
        if (!force && Undefinable_1.isNotUndefined(this.info.type)) {
            return this.info;
        }
        const results = await this.requestor.sendBatchExecute({
            queries: {
                fDcn4b: [this.info.id, 1],
                VrseUb: [this.info.id, null, null, true],
            },
        });
        Object.assign(this.info, {
            description: results['fDcn4b'][0][1],
            title: results['fDcn4b'][0][2],
            fileSize: results['fDcn4b'][0][5],
        }, GPhotosPhoto.parseInfo(results['VrseUb'][0]));
        return this.info;
    }
    async delete() {
        await this.requestor.sendBatchExecute({
            queries: { XwAOJf: [[], 1, [this.info.id], 3, null, [], []] },
        });
    }
    async modifyCreatedDate({ createdDate, timezoneSec }) {
        await this.getInfo();
        const diffTime = Math.round((createdDate.getTime() - this.info.createdAt.getTime()) / 1000);
        await this.requestor.sendBatchExecute({
            queries: {
                DaSgWe: [[[this.info.id, null, timezoneSec || null, diffTime]]],
            },
        });
        await this.getInfo({ force: true });
    }
    async modifyDescription({ description }) {
        await this.requestor.sendBatchExecute({
            queries: {
                AQNOFd: [null, description, this.info.id],
            },
        });
        await this.getInfo({ force: true });
    }
    toJSON() {
        return this.info;
    }
    toString() {
        return `GPhotosPhoto<${JSON.stringify(this.info, null, 2)}>`;
    }
    [util_1.default.inspect.custom]() {
        return this.toString();
    }
}
exports.GPhotosPhoto = GPhotosPhoto;
