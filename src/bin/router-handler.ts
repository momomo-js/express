import {
    CONTROLLER, IController, METHOD, Mo, MoApplication, MoApplicationCycleLife, Module, MoInstance, OnInit, PARAMS, PATH,
    RouterManager
} from '@mo/core';
import {ExpressManager} from './express-manager';
import {DEL, GET, POST, PUT, RESPOND} from '../decoration/symbol';
import * as co from 'co';
import {requireHandleMethod} from './router/require-handle.method';
import {ResponseHandler} from './router/response.handler';
import {ResMessage} from '../define/res-message.interface';
import {AfterControllerMethod, BeforeControllerMethod} from '../define/controller-plugin.interface';
import e = require('express');
import {Origin} from '../define/origin.class';
import {PARAMETERS} from '../decoration/parameter';
import {Injectable} from 'injection-js';

@Injectable()
export class RouterHandler extends Mo implements OnInit {

    app: e.Express = null;
    controllerList: IController[] = null;
    static paramsDI(cFunParams: String[],
                    resHandler: ResponseHandler,
                    Models: Map<String, any>,
                    req: e.Request,
                    res: e.Response): Object[] {
        const ret = [];
        for (const member of cFunParams) {
            switch (member) {
                case 'ResponseHandler':
                    ret.push(resHandler);
                    break;
                case 'Origin':
                    const o = new Origin();
                    o.request = req;
                    o.response = res;
                    ret.push(o);
                    break;
                default:
                    const model = Models.get(member);
                    if (model) {
                        const mIns = new model();
                        const metaKeys: Set<string> = Reflect.getMetadata(PARAMETERS, mIns);
                        let o: any;
                        if (metaKeys) {
                            o = requireHandleMethod(mIns, metaKeys, [req]);
                        } else {
                            o = requireHandleMethod(mIns, null, [req.query, req.params, req.body])
                        }
                        if (o) {
                            ret.push(o);
                        }
                    } else {
                        ret.push(null);
                    }
                    break;
            }
        }
        return ret;
    }

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

                    switch (method) {
                        case GET:
                            this.app.get(finalPath, (req: e.Request, res: e.Response, next: e.NextFunction) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case POST:
                            this.app.post(finalPath, (req: e.Request, res: e.Response, next: e.NextFunction) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case DEL:
                            this.app.delete(finalPath, (req: e.Request, res: e.Response, next: e.NextFunction) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case PUT:
                            this.app.put(finalPath, (req: e.Request, res: e.Response, next: e.NextFunction) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        default:
                            break;
                    }
                }

            }
        }
    }

    async run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: IController, cFun: Function): Promise<void> {
        // todo 插件管理
        // responseHandler
        const respond_data: ResMessage[] = Reflect.getMetadata(RESPOND, cIns, cFun.name) as ResMessage[];

        const resHandler = new ResponseHandler(res, next, respond_data);

        let result = true;
        // @Before Controller
        for (const m of this.express.beforeControllerMethodList) {
            const method = m as BeforeControllerMethod;
            const methodret = await method(req, resHandler, cIns, cFun);
            if (!methodret) {
                this.debug(`method: ${method.name} return false`);
                result = false;
            }
        }

        if (result) {
            this.debug(`Request (${cIns.constructor.name} -> ${cFun.name})`);
            await this._controller(req, resHandler, cIns, cFun);
        }

        // @After Controller

        for (const method of this.express.afterControllerMethodList) {
            const methodret = await method(resHandler, cIns, cFun);
            if (!methodret) {
                this.debug(`method: ${method.name} return false`);
                // todo
                // 这里如果为false 则应返回500
                result = false;
            }
        }

        resHandler.response();

    }

    async _controller(req: e.Request, resHandler: ResponseHandler, cIns: IController, cFun: Function): Promise<ResponseHandler> {

        // 获取cFun的接口
        const cFunParams: String[] = Reflect.getMetadata(PARAMS, cIns, cFun.name);

        // 比对需要的Model
        const params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req, resHandler['res']);

        // 运行cFun
        const ret = await cFun.apply(cIns, params);

        return ret;

    }
}

/**
 * Created by yskun on 2017/7/7.
 */
