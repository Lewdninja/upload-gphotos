"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tough_cookie_1 = require("tough-cookie");
const Nullable_1 = require("option-t/cjs/Nullable");
const unwrapOrElse_1 = require("option-t/cjs/Undefinable/unwrapOrElse");
const puppeteer_1 = require("./puppeteer");
const constants_1 = require("./constants");
const get_chrome_path_1 = require("./get_chrome_path");
async function setCookie({ cookie, url, jar }) {
    return new Promise((resolve, reject) => {
        jar.setCookie(new tough_cookie_1.Cookie({
            key: cookie.name,
            value: cookie.value,
            expires: new Date(cookie.expires * 1000),
            domain: cookie.domain.replace(/^\./, ''),
            path: cookie.path,
        }), url, {
            http: cookie.httpOnly,
            secure: cookie.secure,
            ignoreError: true,
        }, (err) => (err ? reject(err) : resolve()));
    });
}
async function signinViaPuppeteer({ username, password, jar }) {
    const chromePath = unwrapOrElse_1.unwrapOrElseFromUndefinable(process.env.PUPPETEER_EXECUTABLE_PATH, () => get_chrome_path_1.getChromePath());
    if (Nullable_1.isNull(chromePath)) {
        throw new Error('Chrome / Chromium binary was not found. Please set binary path to PUPPETEER_EXECUTABLE_PATH envrionment manually.');
    }
    const browser = await puppeteer_1.puppeteer.launch({
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.setUserAgent(constants_1.USER_AGENT);
        await Promise.all([
            page.waitForSelector('input[type="email"]', { visible: true }),
            page.goto('https://accounts.google.com/ServiceLogin', { waitUntil: 'networkidle2' }),
        ]);
        const $email = await page.$('input[type="email"]');
        if ($email === null) {
            throw new Error('An email input was not found.');
        }
        await $email.type(username);
        await Promise.all([page.waitForSelector('input[type="password"]', { visible: true }), $email.press('Enter')]);
        const $password = await page.$('input[type="password"]');
        if ($password === null) {
            throw new Error('A password input was not found.');
        }
        await $password.type(password);
        await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), $password.press('Enter')]);
        const cookies = await page.cookies();
        await Promise.all(cookies.map((cookie) => setCookie({ cookie, jar, url: page.url() })));
    }
    finally {
        await browser.close();
    }
}
exports.signinViaPuppeteer = signinViaPuppeteer;
