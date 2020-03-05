import { CookieJar } from 'tough-cookie';
declare type LoginParams = {
    username: string;
    password: string;
    jar: CookieJar;
};
declare function signinViaPuppeteer({ username, password, jar }: LoginParams): Promise<void>;
export { signinViaPuppeteer };
