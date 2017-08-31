import {IParameter} from "../define/parameter.interface";

let QUERY = 'query';
let PARAM = 'params';
let BODY = 'body';

export let ARRAY_TYPE = 'array_type';
export let PARAMETERS = 'response:parameters';

export let Query = decorator(QUERY);
export let Param = decorator(PARAM);
export let Body = decorator(BODY);


function decorator(Type: string) {
    return function (target: any, propertyKey: string) {
        let type: string = Reflect.getMetadata("design:type", target, propertyKey);

        if (type) {
            let p: IParameter = {
                property: propertyKey,
                type: type
            };

            let parameters: IParameter[] = Reflect.getMetadata(Type, target);
            if (!parameters) {
                parameters = [];
                Reflect.defineMetadata(Type, parameters, target);
            }

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
        if(Type)
        {
            Reflect.defineMetadata(ARRAY_TYPE,Type,target,propertyKey);
        }
    }
}