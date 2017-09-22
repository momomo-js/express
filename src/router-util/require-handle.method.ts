import {IParameter} from "../define/parameter.interface";
import {ARRAY_TYPE} from "../decorator/parameter";

function typeHandler(object: string, type: Object) {
    switch (type) {
        case Number:
            return Number(object);
        case Boolean:
            return Boolean(object);
        case Date:
            return new Date(object);
        case String:
            return object;
        default:
            return object;
    }
}

export function requireHandleMethod(RequireModel: any, metadataKeys: Set<string>, target: any): any {
    //初始化返回对象

    let ret = RequireModel;
    //获取需要的属性
    for (let key of metadataKeys) {
        let parameters: IParameter[] = Reflect.getMetadata(key, RequireModel);
        let object = target[key];

        if (!object) {
            continue;
        }

        for (let parameter of parameters) {

            if (!object[parameter.property]) {
                continue;
            }

            if (parameter.type === Array && object[parameter.property].length) {
                let type = Reflect.getMetadata(ARRAY_TYPE, RequireModel, parameter.property);
                if (type) {
                    ret[parameter.property] = [];
                    for (let i = 0; i < object[parameter.property].length; i++) {
                        ret[parameter.property].push(typeHandler(object[parameter.property][i], type));
                    }
                } else {
                    ret[parameter.property] = object[parameter.property];
                }
            } else {
                ret[parameter.property] = typeHandler(object[parameter.property], parameter.type);
            }
        }

    }

    return ret;
}

/**
 * Created by yskun on 2017/4/29.
 */
