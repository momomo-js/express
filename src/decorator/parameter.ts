import {IParameter} from '../define/parameter.interface';
import {MetadataArray} from "@mo/core";

export const QUERY = 'query';
export const PARAMS = 'params';
export const BODY = 'body';

export let ARRAY_TYPE = 'array_type';
export let PARAMETERS = 'response:parameters';

export let Query = decorator(QUERY);
export let Params = decorator(PARAMS);
export let Body = decorator(BODY);


function decorator(Type: string) {
    return function (target: any, propertyKey: string) {
        const type: string = Reflect.getMetadata('design:type', target, propertyKey);

        if (type) {
            const p: IParameter = {
                property: propertyKey,
                type: type
            };

            const parameters: IParameter[] = MetadataArray(Type, target);
            parameters.push(p);

            let types: Set<string> = Reflect.getMetadata(PARAMETERS, target);
            if (!types) {
                types = new Set();
                Reflect.defineMetadata(PARAMETERS, types, target);
            }

            types.add(Type);
        }
    }
}

export function ArrayType(Type: Object) {
    return function (target: any, propertyKey: string) {
        if (Type) {
            Reflect.defineMetadata(ARRAY_TYPE, Type, target, propertyKey);
        }
    }
}
