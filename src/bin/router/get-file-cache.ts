import * as fs from "fs";

let cache = {};


export function getFileCache(absPath: string, callback: Function) {
    if (cache[absPath]) {
        callback(null, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        callback(err, data);
                    } else {
                        cache[absPath] = data;
                        callback(err, data);
                    }
                });
            } else {
                callback(null, null);
            }
        });
    }
}

/**
 * Created by yskun on 2017/4/26.
 */
