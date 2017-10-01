import {MetadataArray, Parameter, PARAMS} from "@mo/core";

export function Require(target: any, prop: string, index?: number) {
    if (!index) {
        Reflect.defineMetadata("parameters:require", true, target, prop);
    } else {
        const specParam: Parameter[] = MetadataArray(PARAMS, target, <string>prop);
        if (specParam[index]) {
            specParam[index].require = true;
        } else {
            throw new Error(`Require Decorator must after Type Decorator`);
        }
    }
}