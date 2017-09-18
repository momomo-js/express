import {CONTROLLER, IController, METHOD, Mo, OnInit, PATH, RouterManager} from '@mo/core';
import {ExpressManager} from './express-manager';
import {DEL, GET, POST, PUT, RESPOND} from '../decoration/symbol';
import {requireHandleMethod} from './router/require-handle.method';
import {ResponseHandler} from './router/response.handler';
import {ResMessage} from '../define/res-message.interface';
import {Origin} from '../define/origin.class';
import {PARAMETERS} from '../decoration/parameter';
import {Injectable} from 'injection-js';
import {ControllerFunction, FunctionDi, Parameter} from './function-di';
import e = require('express');

@Injectable()
export class RouterHandler extends Mo implements OnInit {

    app: e.Express = null;
    controllerList: IController[] = null;

    private static getFinalPath(cPath: string, mPath: string): string {
        // todo
        if (mPath === '/') {
            return cPath;
        } else {
            return (cPath === '/' ? '' : cPath) + mPath;
        }
    }

    constructor(private express: ExpressManager,
                private routerManager: RouterManager) {
        super();
    }

    onInit() {
        this.initController();
    }

    initController() {
        this.debug(`init Controller`);
        this.app = this.express.app;
        if (!this.app) {
            throw new Error(`app is null`);
        }

        this.controllerList = this.routerManager.controllerList;

        let router = e.Router();

        for (const controller of this.controllerList) {
            const cPath = Reflect.getMetadata(PATH, controller);
            const members = Reflect.getMetadata(CONTROLLER, controller);

            if (members) {
                for (const member of members) {
                    // todo
                    const method = Reflect.getMetadata(METHOD, controller, member.name);

                    if (!method) {
                        continue;
                    }

                    // todo
                    const mPath = Reflect.getMetadata(PATH, controller, member.name);

                    const finalPath = RouterHandler.getFinalPath(cPath, mPath);

                    this.debug(`register: ${method.toString().replace('Symbol', '')} -> ${finalPath}`);

                    let methodStr;
                    switch (method) {
                        case GET:
                            methodStr = 'get';
                            break;
                        case POST:
                            methodStr = 'post';
                            break;
                        case DEL:
                            methodStr = 'delete';
                            break;
                        case PUT:
                            methodStr = 'put';
                            break;
                        default:
                            break;
                    }
                    if (methodStr) {
                        router[methodStr](finalPath, (req: e.Request, res: e.Response, next: e.NextFunction) => {
                            this.run(req, res, next, controller, member)
                                .catch((reason: Error) => {
                                    next(reason);
                                });
                        });
                    }

                }

            }
        }

        this.app.use(router);
    }

    async plugin(di: FunctionDi, controllerFunction: ControllerFunction, type: 'before' | 'after') {
        let result = true;
        // @Before Controller
        let pluginDI = di.createChild([
            {
                type: ControllerFunction,
                useValue: controllerFunction
            }
        ]);
        const List = type === 'before' ? this.express.beforeControllerMethodList : this.express.afterControllerMethodList;
        for (const method of List) {
            const param = pluginDI.resolve(method[0], method[1]);
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

    async run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: IController, cFun: Function): Promise<void> {

        // todo 插件管理
        // responseHandler
        const respond_data: ResMessage[] = Reflect.getMetadata(RESPOND, cIns, cFun.name) as ResMessage[];

        const resHandler = new ResponseHandler(res, next, respond_data);

        // di-inject
        const di = FunctionDi
            .create(
                [
                    {type: ResponseHandler, useValue: resHandler},
                    {type: Origin, useValue: new Origin(req, res)}
                ]);

        let controllerFunction = new ControllerFunction(cIns, cFun);

        const result = await this.plugin(di, controllerFunction, 'before');

        if (result) {
            this.debug(`Request (${cIns.constructor.name} -> ${cFun.name})`);
            await this._controller(req, di, cIns, cFun);
        }

        // @After Controller

        await this.plugin(di, controllerFunction, 'after');

        resHandler.response();

    }

    getParam(di: FunctionDi, req: e.Request, param: Parameter) {
        let pos = param.type.split(':');
        if (pos[0] === 'body' || pos[0] === 'params' || pos[0] === 'query') {
            if (pos[0] === 'body' && !req.body) {
                throw new Error(`request hasn't body`);
            }

            let value = req[pos[0]];
            for (let p = 1; p < pos.length; p++) {
                value = value[pos[p]];
            }

            if (value) {
                di.push([{
                    type: param.type,
                    useValue: value
                }]);
            }
        }
    }

    async _controller(req: e.Request, di: FunctionDi, cIns: IController, cFun: Function): Promise<ResponseHandler> {

        // 获取cFun的接口
        // const cFunParams: String[] = Reflect.getMetadata(PARAMS, cIns, cFun.name);


        // 比对需要的Model
        // const params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req, resHandler['res']);

        const param = FunctionDi.getFunctionParam(cIns, cFun);

        const createList = [];

        for (let n = 0; n < param.length; n++) {
            if (param[n].spec === true) {
                this.getParam(di, req, param[n]);
            } else if (cIns.modelList.has(param[n].type['name'])) {
                createList.push(param[n].type);
            }
        }

        let mList = [];

        for (let model of createList) {
            let mIns = new model;
            const metaKeys: Set<string> = Reflect.getMetadata(PARAMETERS, mIns);
            let o: any;
            if (metaKeys) {
                o = requireHandleMethod(mIns, metaKeys, [req]);
            } else {
                o = requireHandleMethod(mIns, null, [req.query, req.params, req.body])
            }
            if (o) {
                mList.push(o);
            }
        }


        for (let m of mList) {
            di.push([{type: m.constructor, useValue: m}]);
        }

        let params = di.resolve(cIns, cFun);
        // 运行cFun
        return await cFun.apply(cIns, params);

    }
}

/**
 * Created by yskun on 2017/7/7.
 */
