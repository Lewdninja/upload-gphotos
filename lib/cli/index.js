#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const configstore_1 = __importDefault(require("configstore"));
const tough_cookie_1 = require("tough-cookie");
const p_retry_1 = __importDefault(require("p-retry"));
const ora_1 = __importDefault(require("ora"));
const __1 = require("../");
const constants_1 = require("../constants");
const cookies_1 = require("./cookies");
const yargs_1 = require("./yargs");
if (yargs_1.yargs.argv.version) {
    yargs_1.yargs.showHelp();
    process.exit(0);
}
(async () => {
    const files = yargs_1.yargs.argv._;
    try {
        await Promise.all(files.map((path) => fs_1.default.promises.access(path)));
    }
    catch (_err) {
        yargs_1.yargs.showHelp();
        process.abort();
    }
    const { username = yargs_1.yargs.argv.username, password = yargs_1.yargs.argv.password } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Username?',
            when: !yargs_1.yargs.argv.username,
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password?',
            when: !yargs_1.yargs.argv.password,
        },
    ]);
    // Restore cookies
    const conf = new configstore_1.default(constants_1.LIBRARY_NAME, {});
    const jar = conf.has('jar') && conf.has('iv') && username === conf.get('username')
        ? cookies_1.decodeCookie({ password, encoded: conf.get('jar'), iv: Buffer.from(conf.get('iv'), 'base64') })
        : new tough_cookie_1.CookieJar();
    // Login
    const gphotos = new __1.GPhotos();
    gphotos.setCookieJar(jar);
    try {
        await gphotos.signin({
            username,
            password,
        });
    }
    catch (err) {
        console.error(`Failed to login.`);
        throw err;
    }
    // Store cookies
    const encoded = cookies_1.encodeCookie({ jar, password });
    conf.set('username', username);
    conf.set('jar', encoded.encoded);
    conf.set('iv', encoded.iv.toString('base64'));
    const albumList = [];
    for (const albumName of yargs_1.yargs.argv.album) {
        albumList.push((await gphotos.searchAlbum({ title: albumName })) || (await gphotos.createAlbum({ title: albumName, shared: false })));
    }
    for (const albumId of yargs_1.yargs.argv['album-id']) {
        albumList.push(await gphotos.fetchAlbumoById({ id: albumId }));
    }
    for (const filepath of files) {
        const spinner = ora_1.default();
        const photo = await p_retry_1.default(async () => {
            const stream = fs_1.default.createReadStream(filepath);
            const filesize = (await fs_1.default.promises.stat(filepath)).size;
            const filename = path_1.default.basename(filepath);
            if (!yargs_1.yargs.argv.quiet) {
                let passedSize = 0;
                stream.on('open', () => spinner.start(`Uploading "${filename}"`));
                stream.on('data', (chunk) => {
                    passedSize += chunk.length;
                    spinner.text = `Uploading "${filename}" ${Math.floor((passedSize / filesize) * 100)}%`;
                });
                stream.on('end', () => spinner.succeed(`Uploaded "${filename}"`));
            }
            return gphotos.upload({
                stream,
                size: filesize,
                filename,
            });
        }, {
            retries: yargs_1.yargs.argv.retry,
        });
        for (const album of albumList) {
            await album.append(photo);
        }
        if (yargs_1.yargs.argv['output-json']) {
            await fs_1.default.promises.writeFile(filepath.replace(/\.[^.]*?$/, '.upload-info.json'), JSON.stringify(await photo.getInfo(), null, 2), 'utf8');
        }
    }
})().catch(function (err) {
    console.error(err.stack);
    process.abort();
});
