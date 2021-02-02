export interface Dict<T> {
    [key: string]: T | undefined;
}
export declare function Append(items: Array<T>, ...elems: Array<T>): Array<T>;
export declare function Merge(...dicts: Dict<T>): Dict<T>;
export declare function Env(dict?: Dict<T>): Dict<T>;
export declare function ExecFile(file: string, args: Array<string>, opts: child_process.ExecFileOptions): Promise<void>;