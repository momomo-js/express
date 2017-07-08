"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
let cache = {};
function getFileCache(absPath, callback) {
    if (cache[absPath]) {
        callback(null, cache[absPath]);
    }
    else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        callback(err, data);
                    }
                    else {
                        cache[absPath] = data;
                        callback(err, data);
                    }
                });
            }
            else {
                callback(null, null);
            }
        });
    }
}
exports.getFileCache = getFileCache;
//# sourceMappingURL=get-file-cache.js.map