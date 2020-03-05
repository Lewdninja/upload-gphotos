/// <reference types="node" />
import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
declare class Requestor {
    readonly axios: AxiosInstance;
    private atToken;
    constructor();
    get jar(): CookieJar;
    set jar(jar: CookieJar);
    getAtToken(): Promise<string>;
    sendBatchExecute<Result extends Record<string, any>>({ queries, }: {
        queries: Record<keyof Result, any>;
    }): Promise<Result>;
    upload({ stream, size, filename, }: {
        stream: NodeJS.ReadableStream;
        size: number;
        filename: string;
    }): Promise<any>;
}
export { Requestor };
