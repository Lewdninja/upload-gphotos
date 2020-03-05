"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const which_1 = __importDefault(require("which"));
const Nullable_1 = require("option-t/cjs/Nullable");
const Undefinable_1 = require("option-t/cjs/Undefinable");
const unwrapOr_1 = require("option-t/cjs/Undefinable/unwrapOr");
const LINUX_CHROME_NAME_LIST = ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium'];
const MACOS_CHROME_PATH_LIST = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
]
    .map((path) => {
    return ['', process.env.HOME].filter(Undefinable_1.isNotUndefined).map((programDir) => path_1.default.join(programDir, path));
})
    .reduce((a, b) => [...a, ...b], []);
const WIN32_CHROME_PATH_LIST = ['\\Google\\Chrome\\Application\\chrome.exe', '\\Chromium\\Application\\chrome.exe']
    .map((path) => {
    return [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']]
        .filter(Undefinable_1.isNotUndefined)
        .map((programDir) => path_1.default.join(programDir, path));
})
    .reduce((a, b) => [...a, ...b], []);
function getChromePathList() {
    if (process.platform === 'linux') {
        return LINUX_CHROME_NAME_LIST.map((cmd) => which_1.default.sync(cmd, { nothrow: true }));
    }
    if (process.platform === 'darwin') {
        return MACOS_CHROME_PATH_LIST.filter((path) => fs_1.default.existsSync(path));
    }
    if (process.platform === 'win32') {
        return WIN32_CHROME_PATH_LIST.filter((path) => fs_1.default.existsSync(path));
    }
    return [];
}
function getChromePath() {
    const resultList = getChromePathList();
    const [result] = resultList.filter(Nullable_1.isNotNull);
    return unwrapOr_1.unwrapOrFromUndefinable(result, null);
}
exports.getChromePath = getChromePath;
