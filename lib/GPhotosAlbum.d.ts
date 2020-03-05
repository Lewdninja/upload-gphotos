/// <reference types="node" />
import util from 'util';
import { Nullable } from 'option-t/cjs/Nullable';
import { Requestor } from './Requestor';
import { GPhotosPhoto } from './GPhotosPhoto';
declare type GPhotosAlbumInfo = {
    id: string;
    type: 'album';
    title?: string;
    period?: {
        from: Date;
        to: Date;
    };
    itemsCount?: number;
    isShared?: boolean;
};
declare class GPhotosAlbum {
    id: string;
    private info;
    private requestor;
    static parseInfo(data: any): GPhotosAlbumInfo;
    constructor(info: GPhotosAlbumInfo, { requestor }: {
        requestor: Requestor;
    });
    getInfo({ force }?: {
        force: boolean;
    }): Promise<Required<GPhotosAlbumInfo>>;
    append(...photoList: GPhotosPhoto[]): Promise<void>;
    remove(photo: GPhotosPhoto): Promise<void>;
    fetchPhotoList({ cursor, }: {
        cursor: Nullable<string>;
    }): Promise<{
        results: GPhotosPhoto[];
        nextCursor: Nullable<string>;
    }>;
    delete(): Promise<void>;
    toJSON(): GPhotosAlbumInfo;
    toString(): string;
    [util.inspect.custom](): string;
}
export { GPhotosAlbum };
