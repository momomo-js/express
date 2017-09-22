
export class CFunc {

    constructor(public Class: Object, public  Function: Function) {
    }

    getMetadata(key: string | symbol) {
        return Reflect.getMetadata(key, this.Class, this.Function.name);
    }
}
