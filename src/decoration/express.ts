import {ExpressOptions} from "../define/express-options.interface";
import {RESPOND} from "./symbol";

export function Express(options?: ExpressOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (options) {
            if (options.responds) {
                Reflect.defineMetadata(RESPOND, options.responds, target, propertyKey);
            }
        }
    };
}

/**
 * Created by yskun on 2017/7/8.
 */
