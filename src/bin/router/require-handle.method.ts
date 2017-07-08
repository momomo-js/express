import * as co from "co";
import * as _ from "underscore";

export function requireHandleMethod(requireModel: object, ...obj: object[]): object {
        let ret = {};
        for (let i = 0; i < obj.length; i++) {
            _.extend(ret, obj[i]);
        }
        let key = _.keys(requireModel);
        _.pick(ret, key);
        return ret;
}

/**
 * Created by yskun on 2017/4/29.
 */
