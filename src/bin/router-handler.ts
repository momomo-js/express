import {CONTROLLER, IController, METHOD, MoApplication, PARAMS, PATH} from "@mo/core";
import {ExpressServer} from "./express-server";
import {DEL, GET, POST, PUT, RESPOND} from "../decoration/symbol";
import * as co from "co";
import {requireHandleMethod} from "./router/require-handle.method";
import {ResponseHandler} from "./router/response.handler";
import {ResMessage} from "../define/res-message.interface";
import {AfterControllerMethod, BeforeControllerMethod} from "../define/controller-plugin.interface";
import e = require("express");
import {Origin} from "../define/origin.class";
import {PARAMETERS} from "../decoration/parameter";

export class RouterHandler extends MoApplication {
    app: e.Express = null;
    controllerList: IController[] = null;
    express: ExpressServer = null;

    initController() {
        this.debug(`init Controller`);
        this.app = (this.context as ExpressServer).app;
        if (!this.app) {
            throw new Error(`app is null`);
        }

        this.express = this.context as ExpressServer;
        this.controllerList = this.moServer.routerManager.controllerList;

        for (let controller of this.controllerList) {
            let cPath = Reflect.getMetadata(PATH, controller);
            let members = Reflect.getMetadata(CONTROLLER, controller);

            if (members) {
                for (let member of members) {
                    //todo
                    let method = Reflect.getMetadata(METHOD, controller, member.name);

                    if (!method)
                        continue;

                    //to do
                    let mPath = Reflect.getMetadata(PATH, controller, member.name);

                    let finalPath = RouterHandler.getFinalPath(cPath, mPath);

                    this.debug(`register: ${method.toString().replace("Symbol", "")} -> ${finalPath}`);

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

    run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: IController, cFun: Function) {
        let p = this;
        co(function* () {
            //to do 插件管理
            //responseHandler
            let respond_data: ResMessage[] = Reflect.getMetadata(RESPOND, cIns, cFun.name) as ResMessage[];

            let resHandler = new ResponseHandler(res, next, respond_data);

            let result = true;
            //@Before Controller
            for (let m of p.express.beforeControllerMethodList) {
                let method = m as BeforeControllerMethod;
                let methodret = yield method(req, resHandler, cIns, cFun);
                if (!methodret) {
                    p.debug(`method: ${method.name} return false`);
                    result = false;
                }
            }

            if (result) {
                p.debug(`Request (${cIns.constructor.name} -> ${cFun.name})`);
                yield p._controller(req, resHandler, cIns, cFun);
            }

            //@After Controller

            for (let m of p.express.afterControllerMethodList) {
                let method = m as AfterControllerMethod;
                let methodret = yield method(resHandler, cIns, cFun);
                if (!methodret) {
                    p.debug(`method: ${method.name} return false`);
                    //todo
                    //这里如果为false 则应返回500
                    result = false;
                }
            }

            resHandler.response();

        });
    }

    _controller(req: e.Request, resHandler: ResponseHandler, cIns: IController, cFun: Function): ResponseHandler {
        let p = this;
        return co(function* () {


            //获取cFun的接口
            let cFunParams: String[] = Reflect.getMetadata(PARAMS, cIns, cFun.name);

            //比对需要的Model
            let params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req, resHandler['res']);

            //运行cFun
            let ret = yield cFun.apply(cIns, params);

            return ret;

        });
    }

    private static getFinalPath(cPath: string, mPath: string): string {
        //todo
        if (mPath == '/')
            return cPath;
        else {
            return (cPath == '/' ? '' : cPath) + mPath;
        }
    }

    static paramsDI(cFunParams: String[], resHandler: ResponseHandler, Models: Map<String, any>, req: e.Request, res: e.Response): Object[] {
        let ret = [];
        for (let member of cFunParams) {
            switch (member) {
                case "ResponseHandler":
                    ret.push(resHandler);
                    break;
                case "Origin":
                    let o = new Origin();
                    o.request = req;
                    o.response = res;
                    ret.push(o);
                    break;
                default:
                    let model = Models.get(member);
                    if (model) {
                        let mIns = new model();
                        let metaKeys: Set<string> = Reflect.getMetadata(PARAMETERS, mIns);
                        let o = null;
                        if (metaKeys) {
                            o = requireHandleMethod(mIns, metaKeys, [req]);
                        } else {
                            o = requireHandleMethod(mIns, null, [req.query, req.params, req.body])
                        }
                        if (o)
                            ret.push(o);
                    } else {
                        ret.push(null);
                    }
                    break;
            }
        }
        return ret;
    }
}

/**
 * Created by yskun on 2017/7/7.
 */
