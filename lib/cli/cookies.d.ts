/// <reference types="node" />
import { CookieJar } from 'tough-cookie';
declare function decodeCookie({ encoded, password, iv }: {
    encoded: string;
    password: string;
    iv: Buffer;
}): CookieJar;
declare function encodeCookie({ jar, password }: {
    jar: CookieJar;
    password: string;
}): {
    encoded: string;
    iv: Buffer;
};
export { encodeCookie, decodeCookie };
