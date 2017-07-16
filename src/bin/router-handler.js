"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mo/core");
const symbol_1 = require("../decoration/symbol");
const co = require("co");
const require_handle_method_1 = require("./router/require-handle.method");
const response_handler_1 = require("./router/response.handler");
const origin_class_1 = require("../define/origin.class");
class RouterHandler extends core_1.MoApplication {
    constructor() {
        super(...arguments);
        this.app = null;
        this.controllerList = null;
        this.express = null;
    }
    initController() {
        this.debug(`init Controller`);
        this.app = this.context.app;
        if (!this.app) {
            throw new Error(`app is null`);
        }
        this.express = this.context;
        this.controllerList = this.moServer.routerManager.controllerList;
        for (let controller of this.controllerList) {
            let cPath = Reflect.getMetadata(core_1.PATH, controller);
            let members = Reflect.getMetadata(core_1.CONTROLLER, controller);
            if (members) {
                for (let member of members) {
                    let method = Reflect.getMetadata(core_1.METHOD, controller, member.name);
                    if (!method)
                        continue;
                    let mPath = Reflect.getMetadata(core_1.PATH, controller, member.name);
                    let finalPath = RouterHandler.getFinalPath(cPath, mPath);
                    this.debug(`register: ${method.toString().replace("Symbol", "")} -> ${finalPath}`);
                    switch (method) {
                        case symbol_1.GET:
                            this.app.get(finalPath, (req, res, next) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case symbol_1.POST:
                            this.app.post(finalPath, (req, res, next) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case symbol_1.DEL:
                            this.app.delete(finalPath, (req, res, next) => {
                                this.run(req, res, next, controller, member);
                            });
                            break;
                        case symbol_1.PUT:
                            this.app.put(finalPath, (req, res, next) => {
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
    run(req, res, next, cIns, cFun) {
        let p = this;
        co(function* () {
            let respond_data = Reflect.getMetadata(symbol_1.RESPOND, cIns, cFun.name);
            let resHandler = new response_handler_1.ResponseHandler(res, next, respond_data);
            let result = true;
            for (let m of p.express.beforeControllerMethodList) {
                let method = m;
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
            for (let m of p.express.afterControllerMethodList) {
                let method = m;
                let methodret = yield method(resHandler, cIns, cFun);
                if (!methodret) {
                    p.debug(`method: ${method.name} return false`);
                    result = false;
                }
            }
            resHandler.response();
        });
    }
    _controller(req, resHandler, cIns, cFun) {
        let p = this;
        return co(function* () {
            let cFunParams = Reflect.getMetadata(core_1.PARAMS, cIns, cFun.name);
            let params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req, resHandler['res']);
            let ret = yield cFun.apply(cIns, params);
            return ret;
        });
    }
    static getFinalPath(cPath, mPath) {
        if (mPath == '/')
            return cPath;
        else {
            return (cPath == '/' ? '' : cPath) + mPath;
        }
    }
    static paramsDI(cFunParams, resHandler, Models, req, res) {
        let ret = [];
        for (let member of cFunParams) {
            switch (member) {
                case "ResponseHandler":
                    ret.push(resHandler);
                    break;
                case "Origin":
                    let o = new origin_class_1.Origin();
                    o.request = req;
                    o.response = res;
                    ret.push(o);
                    break;
                default:
                    let model = Models.get(member);
                    if (model) {
                        let o = require_handle_method_1.requireHandleMethod(model, req.params, req.body);
                        ret.push(o);
                    }
                    break;
            }
        }
        return ret;
    }
}
exports.RouterHandler = RouterHandler;
//# sourceMappingURL=router-handler.js.map