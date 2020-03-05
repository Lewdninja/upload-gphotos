import _yargs from 'yargs';
declare const yargs: _yargs.Argv<_yargs.Omit<{}, "password" | "username" | "album" | "help" | "retry" | "album-id" | "quiet" | "output-json" | "version"> & _yargs.InferredOptionTypes<{
    retry: {
        alias: string;
        type: "number";
        default: number;
        desc: string;
    };
    username: {
        alias: string;
        type: "string";
        desc: string;
    };
    password: {
        alias: string;
        type: "string";
        desc: string;
    };
    album: {
        alias: string;
        type: "array";
        default: string[];
        desc: string;
    };
    'album-id': {
        alias: string;
        type: "array";
        default: string[];
        desc: string;
    };
    quiet: {
        type: "boolean";
        default: boolean;
        desc: string;
    };
    'output-json': {
        type: "boolean";
        default: boolean;
        desc: string;
    };
    help: {
        alias: string;
        type: "boolean";
        desc: string;
    };
    version: {
        alias: string;
        type: "boolean";
        desc: string;
    };
}>>;
export { yargs };
