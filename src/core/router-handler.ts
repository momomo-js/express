import {
    CONTROLLER,
    FunctionDi,
    METHOD,
    MoBasic,
    OnInit,
    OnStart,
    Parameter,
    PATH,
    MODEL_LIST,
    RouterManager,
    getSymbolDescription
} from '@mo/core';
import {ExpressManager} from './express-manager';
import {RESPOND} from '../decorator/symbol';
import {requireHandleMethod, typeHandler} from '../router-util/require-handle.method';
import {ResponseHandler} from '../router-util/response.handler';
import {ResMessage} from '../define/res-message.interface';
import {Origin} from '../define/origin.class';
import {PARAMETERS} from '../decorator/parameter';
import {Injectable} from 'injection-js';
import {CFunc} from '../define/c-func.class';
import e = require('express');
import {isUndefined} from "util";


@Injectable()
export class RouterHandler extends MoBasic implements OnInit, OnStart {

    app: e.Express = null;
    controllerList: any[] = null;

    private static getFinalPath(cPath: string, mPath: string): string {
        // todo
        if (mPath === '/') {
            return cPath;
        } else {
            return (cPath === '/' ? '' : cPath) + mPath;
        }
    }

    static createResHandler(res: e.Response, next: e.NextFunction, cFunc: CFunc): ResponseHandler {
        // responseHandler
        const respond_data: ResMessage[] =
            Reflect.getMetadata(RESPOND, cFunc.Class, cFunc.Function.name) as ResMessage[];
        return new ResponseHandler(res, next, respond_data);
    }

    static createOrigin(req: e.Request, res: e.Response): Origin {
        return new Origin(req, res);
    }

    static getParam(di: FunctionDi, req: e.Request, param: Parameter) {
        let pos = param.target.split(':');
        if (pos[0] === 'body' || pos[0] === 'params' || pos[0] === 'query') {
            if (pos[0] === 'body' && !req.body) {
                throw new Error(`request hasn't body`);
            }

            let value = req[pos[0]];
            for (let p = 1; p < pos.length; p++) {
                if (isUndefined(value)) {
                    break;
                }

                value = value[pos[p]];
            }

            let v;
            if (value) {
                v = typeHandler(value, param.type);
            }


            di.push([{
                type: param.type,
                useValue: !isUndefined(value) ? v : null
            }]);
        }
    }

    constructor(private routerManager: RouterManager, public express: ExpressManager) {
        super();
    }

    onInit() {
        this.debug(`init Controller`);
        this.app = this.express.app;
        if (!this.app) {
            throw new Error(`app is null`);
        }
    }

    onStart() {
        this.controllerList = this.routerManager.controllerList;

        let router = e.Router();

        for (const controller of this.controllerList) {
            const cPath = Reflect.getMetadata(PATH, controller.constructor);
            const members = Reflect.getMetadata(CONTROLLER, controller);

            if (!members) {
                continue;
            }

            for (const member of members) {
                const method: symbol = Reflect.getMetadata(METHOD, controller, member.name);

                if (!method) {
                    continue;
                }

                const mPath = Reflect.getMetadata(PATH, controller, member.name);

                const finalPath = RouterHandler.getFinalPath(cPath, mPath);

                let method_str = getSymbolDescription(method).toLowerCase();

                this.debug(`register: （${method_str}） -> ${finalPath}`);

                if (!method_str) {
                    continue;
                }

                const cFunc = new CFunc(controller, member);

                const di: FunctionDi = FunctionDi.create([{
                    type: CFunc,
                    useValue: cFunc
                }]);

                router[method_str](
                    finalPath,
                    (req: e.Request, res: e.Response, next: e.NextFunction) => {
                        this.run(req, res, next, di, cFunc)
                            .catch((reason: Error) => {
                                next(reason);
                            });
                    });
            }
        }

        this.app.use(router);
    }

    private async run(req: e.Request, res: e.Response, next: e.NextFunction, di: FunctionDi, cFunc: CFunc) {
        const responseHandler = RouterHandler.createResHandler(res, next, cFunc);
        const origin = RouterHandler.createOrigin(req, res);

        const cDi: FunctionDi = di.createChild([
            {
                type: Origin,
                useValue: origin
            },
            {
                type: ResponseHandler,
                useValue: responseHandler
            }
        ]);

        await this.process(cDi);
    }


    async process(di: FunctionDi): Promise<void> {

        // 运行前置插件
        const result = await this.plugin_process(di, 'before');

        if (result) {
            const cFunc: CFunc = di.get(CFunc);
            this.debug(`Request (${cFunc.Class.constructor.name} -> ${cFunc.Function.name})`);
            await RouterHandler.controller_process(di);
        }

        // 运行后置插件
        await this.plugin_process(di, 'after');

        const responseHandler: ResponseHandler = di.get(ResponseHandler);
        responseHandler.response();

    }

    async plugin_process(di: FunctionDi, type: 'before' | 'after') {
        let result = true;

        const List = type === 'before' ?
            this.express.beforeControllerMethodList : this.express.afterControllerMethodList;

        for (const method of List) {
            const param = di.resolve(method[0], method[1]);
            const pluginResult = await method[1].apply(method[0], param);

            if (pluginResult === false) {
                this.debug(`method: ${method[1].name} return false on ${type}ExpressControllerPlugin.`);
                result = false;
            } else if (pluginResult && pluginResult !== true && type === 'before') {
                di.push([{type: pluginResult.constructor, useValue: pluginResult}])
            }
        }

        return result;
    }


    static async controller_process(di: FunctionDi): Promise<ResponseHandler> {
        const cFunc: CFunc = di.get(CFunc);
        RouterHandler.getParamModels(di);

        // 获取func需要的参数
        let params = di.resolve(cFunc.Class, cFunc.Function);
        return await cFunc.Function.apply(cFunc.Class, params);

    }

    private static getParamModels(di: FunctionDi) {
        const cFunc: CFunc = di.get(CFunc);
        const origin: Origin = di.get(Origin);

        const params = FunctionDi.getFunctionParam(cFunc.Class, cFunc.Function);
        const providers: Set<any> = Reflect.getMetadata(MODEL_LIST, cFunc.Class.constructor);


        const reqModels = [];
        for (let param of params) {
            if (param.spec === true) {
                RouterHandler.getParam(di, origin.request, param);
            } else if (providers && providers.has(param.type)) {
                reqModels.push(param.type);
            }
        }

        let mList = [];

        for (let model of reqModels) {
            let mIns = new model;
            const metaKeys: Set<string> = Reflect.getMetadata(PARAMETERS, mIns);
            let o: any = requireHandleMethod(mIns, metaKeys, origin.request);

            if (o) {
                mList.push(o);
            }
        }

        for (let m of mList) {
            di.push([{type: m.constructor, useValue: m}]);
        }
    }

}

/**
 * Created by yskun on 2017/7/7.
 */
