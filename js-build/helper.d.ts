export declare class Target {
    readonly os: string;
    readonly arch: string;
    readonly debug: string;
    readonly name: string;
    readonly ext: string;
    constructor(os: string, arch: string, name: string, ext: string, debug: boolean);
    build(): Promise<void>;
    pack(algorithm: string, ...names: Array<string>): Promise<void>;
}
export declare function Append(items: Array<any>, ...elems: Array<any>)
export declare function Build(program: any, os: string, arch: Array<string>, name: string, ext: string, ...packs: Array<string>)
export declare function BuildTest(pkg: string, pkg: string, unit: Array<string>, bench: Array<string>);