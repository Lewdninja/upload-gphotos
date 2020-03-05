/// <reference types="node" />
import util from 'util';
import { Requestor } from './Requestor';
declare type GPhotosPhotoInfo = {
    id: string;
    type?: 'photo' | 'video' | 'animation_gif';
    uploadedAt?: Date;
    createdAt?: Date;
    title?: string;
    description?: string;
    duration?: number;
    width?: number;
    height?: number;
    fileSize?: number;
    rawUrl?: string;
};
declare class GPhotosPhoto {
    id: string;
    private info;
    private requestor;
    static parseInfo(data: any): GPhotosPhotoInfo;
    constructor(info: GPhotosPhotoInfo, { requestor }: {
        requestor: Requestor;
    });
    getInfo({ force }?: {
        force: boolean;
    }): Promise<Required<GPhotosPhotoInfo>>;
    delete(): Promise<void>;
    modifyCreatedDate({ createdDate, timezoneSec }: {
        createdDate: Date;
        timezoneSec?: number;
    }): Promise<void>;
    modifyDescription({ description }: {
        description: string;
    }): Promise<void>;
    toJSON(): GPhotosPhotoInfo;
    toString(): string;
    [util.inspect.custom](): string;
}
export { GPhotosPhoto };
