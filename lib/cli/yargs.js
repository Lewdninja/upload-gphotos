"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const packageInfo = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../package.json'), 'utf8'));
const yargs = yargs_1.default
    .demand(1)
    .usage(`
Upload-GPhotos ${packageInfo.version}
Usage: upload-gphotos file [...] [--no-output-json] [--quiet] [-r retry] [-u username] [-p password] [-a albumname] [--aid albumid]
  `.trim())
    .help('help')
    .strict()
    .options({
    retry: {
        alias: 'r',
        type: 'number',
        default: 3,
        desc: 'The number of times to retry when failed uploads.',
    },
    username: {
        alias: 'u',
        type: 'string',
        desc: 'Google account username.',
    },
    password: {
        alias: 'p',
        type: 'string',
        desc: 'Google account password.',
    },
    album: {
        alias: 'a',
        type: 'array',
        default: [],
        desc: 'The names of albums to put uploaded files.',
    },
    'album-id': {
        alias: 'aid',
        type: 'array',
        default: [],
        desc: 'The ids of albums to put uploaded files.',
    },
    quiet: {
        type: 'boolean',
        default: false,
        desc: 'Prevent to show progress.',
    },
    'output-json': {
        type: 'boolean',
        default: true,
        desc: 'Output information of uploading as JSON.',
    },
    help: {
        alias: 'h',
        type: 'boolean',
        desc: 'Show help.',
    },
    version: {
        alias: 'v',
        type: 'boolean',
        desc: 'Show version number.',
    },
});
exports.yargs = yargs;
