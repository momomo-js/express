"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = require("./symbol");
function Express(options) {
    return function (target, propertyKey, descriptor) {
        if (options) {
            if (options.responds) {
                Reflect.defineMetadata(symbol_1.RESPOND, options.responds, target, propertyKey);
            }
        }
    };
}
exports.Express = Express;
//# sourceMappingURL=express.js.map