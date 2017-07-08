import {CONTROLLER, ControllerInterface, METHOD, MoApplication, PARAMS, PATH} from "@mo/core";
import {ExpressServer} from "./express-server";
import {DEL, GET, POST, PUT, RESPOND} from "../decoration/symbol";
import * as co from "co";
import {requireHandleMethod} from "./router/require-handle.method";
import {ResponseHandler} from "./router/response.handler";
import {ResMessage} from "../decoration/res-message.interface";
import e = require("express");

export class RouterHandler extends MoApplication {
    app: e.Express = null;
    controllerList: ControllerInterface[] = null;

    initController() {
        this.app = (this.context as ExpressServer).app;
        if (!this.app) {
            throw new Error(`app is null`);
        }

        this.controllerList = this.moServer.routerManager.controllerList;

        for (let controller of this.controllerList) {
            let cPath = Reflect.getMetadata(PATH, controller);
            let members = Reflect.getMetadata(CONTROLLER, controller);
            for (let member of members) {
                //todo
                let method = Reflect.getMetadata(METHOD, controller, member.name);

                if (!method)
                    continue;

                //to do 
                let mPath = Reflect.getMetadata(PATH, controller, member.name);

                let finalPath = RouterHandler.getFinalPath(cPath, mPath);

                this.debug(`${method.toString().replace("Symbol","")} -> ${finalPath}`);

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

    run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: ControllerInterface, cFun: Function) {
        let p = this;
        co(function *() {
            p.debug(`Request (${cIns.constructor.name} -> ${cFun.name})`);
            //to do 插件管理
            p._controller(req, res, next, cIns, cFun);
        });
    }

    _controller(req: e.Request, res: e.Response, next: e.NextFunction, cIns: ControllerInterface, cFun: Function) {
        let p = this;
        co(function *() {
            //responseHandler
            let respond_data: ResMessage[] = Reflect.getMetadata(RESPOND, cIns, cFun.name) as ResMessage[];

            let resHandler = new ResponseHandler(res, next, respond_data);

            //获取cFun的接口
            let cFunParams: String[] = Reflect.getMetadata(PARAMS, cIns, cFun.name);

            //比对需要的Model
            let params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req);

            //运行cFun
            let ret = yield cFun.apply(cIns, params);

            ret.response();

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

    static paramsDI(cFunParams: String[], resHandler: ResponseHandler, Models: Map<String, Object>, req: e.Request): Object[] {
        let ret = [];
        for (let member of cFunParams) {
            switch (member) {
                case "ResponseHandler":
                    ret.push(resHandler);
                    break;
                default:
                    let model = Models.get(member);
                    if (model) {
                        let o = requireHandleMethod(model, req.params, req.body);
                        ret.push(o);
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
