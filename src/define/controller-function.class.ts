
export class ControllerFunction {

    constructor(public Class: Object, public  Function: Function) {
    }

    getMetaData(key: string | symbol) {
        return Reflect.getMetadata(key, this.Class, this.Function.name);
    }
}
