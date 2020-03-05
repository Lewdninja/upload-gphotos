/// <reference types="node" />
import util from 'util';
import { CookieJar } from 'tough-cookie';
import { Nullable } from 'option-t/cjs/Nullable';
import { GPhotosPhoto } from './GPhotosPhoto';
import { GPhotosAlbum } from './GPhotosAlbum';
declare type LoginParams = {
    username: string;
    password: string;
};
declare class GPhotos {
    private requestor;
    constructor();
    setCookieJar(jar: CookieJar): void;
    signin(params: LoginParams): Promise<void>;
    fetchAlbumoById({ id }: {
        id: string;
    }): Promise<GPhotosAlbum>;
    fetchAlbumList({ cursor, }: {
        cursor: Nullable<string>;
    }): Promise<{
        results: GPhotosAlbum[];
        nextCursor: Nullable<string>;
    }>;
    searchAlbum({ title }: {
        title: string;
    }): Promise<Nullable<GPhotosAlbum>>;
    createAlbum({ title, shared }: {
        title: string;
        shared: boolean;
    }): Promise<GPhotosAlbum>;
    private createAlbumLegacyFallback;
    fetchPhotoById({ id }: {
        id: string;
    }): Promise<GPhotosPhoto>;
    fetchPhotoList({ cursor, }: {
        cursor: Nullable<string>;
    }): Promise<{
        results: GPhotosPhoto[];
        nextCursor: Nullable<string>;
    }>;
    upload({ stream, size, filename, }: {
        stream: NodeJS.ReadableStream;
        size: number;
        filename: string;
    }): Promise<GPhotosPhoto>;
    toJSON(): {};
    toString(): string;
    [util.inspect.custom](): string;
}
export { GPhotos };
