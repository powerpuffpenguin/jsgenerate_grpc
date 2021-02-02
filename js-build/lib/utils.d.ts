/// <reference types="node" />
import { ExecFileOptions } from 'child_process';
export interface Dict {
    [key: string]: any;
}
export declare function Merge(...objs: Array<Dict>): Dict;
export declare function Env(obj: Dict): Dict;
export declare function ExecFile(file: string, args: Array<string>, opts: ExecFileOptions): Promise<void>;
export declare function Append(items: Array<any>, ...elems: Array<any>): any[];
