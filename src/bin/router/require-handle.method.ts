import * as _ from "underscore";

//todo 需要重写的函数
//将填充与类型转换分离
export function requireHandleMethod(requireModel: object, ...obj: object[]): object {
    let ret = {};
    for (let i = 0; i < obj.length; i++) {
        _.extend(ret, obj[i]);
    }
    let key = _.keys(requireModel);
    _.pick(ret, key);

    for (let q in requireModel) {
        //todo
        if (requireModel[q] !== 'string'  && ret[q]) {
            switch (requireModel[q]) {
                case 1:
                    ret[q] = Number(ret[q]);
                    break;
                case 2:
                    ret[q] = Boolean(ret[q]);
                    break;
            }
        }
    }
    return ret;
}

/**
 * Created by yskun on 2017/4/29.
 */
