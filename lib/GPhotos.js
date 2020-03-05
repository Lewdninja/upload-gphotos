"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const Nullable_1 = require("option-t/cjs/Nullable");
const Maybe_1 = require("option-t/cjs/Maybe");
const Undefinable_1 = require("option-t/cjs/Undefinable");
const signin_via_puppeteer_1 = require("./signin_via_puppeteer");
const Requestor_1 = require("./Requestor");
const GPhotosPhoto_1 = require("./GPhotosPhoto");
const GPhotosAlbum_1 = require("./GPhotosAlbum");
class GPhotos {
    constructor() {
        this.requestor = new Requestor_1.Requestor();
    }
    setCookieJar(jar) {
        this.requestor.jar = jar;
    }
    async signin(params) {
        try {
            await this.requestor.getAtToken();
        }
        catch (_err) {
            await signin_via_puppeteer_1.signinViaPuppeteer({ ...params, jar: this.requestor.jar });
            await this.requestor.getAtToken();
        }
    }
    async fetchAlbumoById({ id }) {
        const album = new GPhotosAlbum_1.GPhotosAlbum({ id, type: 'album' }, { requestor: this.requestor });
        await album.getInfo();
        return album;
    }
    async fetchAlbumList({ cursor, }) {
        const { Z5xsfc: [albumInfoList, nextCursor], } = await this.requestor.sendBatchExecute({
            queries: {
                Z5xsfc: [cursor, null, null, null, 1],
            },
        });
        if (Nullable_1.isNull(albumInfoList)) {
            return {
                results: [],
                nextCursor: null,
            };
        }
        const albumList = albumInfoList.map((data) => {
            return new GPhotosAlbum_1.GPhotosAlbum(GPhotosAlbum_1.GPhotosAlbum.parseInfo(data), {
                requestor: this.requestor,
            });
        });
        // NOTE: Cursor maybe undefined or null or empty string.
        if (Maybe_1.isNullOrUndefined(nextCursor) || cursor === '') {
            return { results: albumList, nextCursor: null };
        }
        return { results: albumList, nextCursor };
    }
    async searchAlbum({ title }) {
        let cursor = null;
        do {
            const { results, nextCursor } = await this.fetchAlbumList({ cursor });
            for (const album of results) {
                const albumInfo = await album.getInfo();
                if (albumInfo.title === title) {
                    return album;
                }
            }
            cursor = nextCursor;
        } while (Nullable_1.isNotNull(cursor));
        return null;
    }
    async createAlbum({ title, shared }) {
        try {
            const { OXvT9d: [[albumId]], } = await this.requestor.sendBatchExecute({
                queries: {
                    OXvT9d: [title, null, 2, []],
                },
            });
            const album = new GPhotosAlbum_1.GPhotosAlbum({
                title,
                id: albumId,
                type: 'album',
                period: { from: new Date(0), to: new Date(0) },
                itemsCount: 0,
                isShared: shared,
            }, { requestor: this.requestor });
            return album;
        }
        catch (_err) {
            return this.createAlbumLegacyFallback({ title });
        }
    }
    async createAlbumLegacyFallback({ title }) {
        const { results: [latestPhoto], } = await this.fetchPhotoList({ cursor: null });
        if (Undefinable_1.isUndefined(latestPhoto)) {
            throw new Error('No photos exists in your account.');
        }
        const { OXvT9d: [[albumId]], } = await this.requestor.sendBatchExecute({
            queries: {
                OXvT9d: [title, null, 1, [[[latestPhoto.id]]]],
            },
        });
        const album = new GPhotosAlbum_1.GPhotosAlbum({
            title,
            id: albumId,
            type: 'album',
            period: { from: new Date(0), to: new Date(0) },
            itemsCount: 0,
            isShared: false,
        }, { requestor: this.requestor });
        const { results: [insertedPhoto], } = await album.fetchPhotoList({ cursor: null });
        await album.remove(insertedPhoto);
        return album;
    }
    async fetchPhotoById({ id }) {
        const photo = new GPhotosPhoto_1.GPhotosPhoto({ id }, { requestor: this.requestor });
        await photo.getInfo();
        return photo;
    }
    async fetchPhotoList({ cursor, }) {
        const { lcxiM: [photoInfoList, nextCursor], } = await this.requestor.sendBatchExecute({
            queries: {
                lcxiM: [cursor, null, null, null, 1],
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
    async upload({ stream, size, filename, }) {
        const data = await this.requestor.upload({ stream, size, filename });
        const photo = new GPhotosPhoto_1.GPhotosPhoto(GPhotosPhoto_1.GPhotosPhoto.parseInfo(data), { requestor: this.requestor });
        return photo;
    }
    toJSON() {
        return {};
    }
    toString() {
        return 'GPhotos';
    }
    [util_1.default.inspect.custom]() {
        return this.toString();
    }
}
exports.GPhotos = GPhotos;
