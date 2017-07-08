"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
function requireHandleMethod(requireModel, ...obj) {
    let ret = {};
    for (let i = 0; i < obj.length; i++) {
        _.extend(ret, obj[i]);
    }
    let key = _.keys(requireModel);
    _.pick(ret, key);
    return ret;
}
exports.requireHandleMethod = requireHandleMethod;
//# sourceMappingURL=require-handle.method.js.map