export declare class Target {
    readonly os: string;
    readonly arch: string;
    readonly ext: string;
    constructor(os: string, arch: string, ext: string);
    build(name: string, debug?: boolean): void;
}
