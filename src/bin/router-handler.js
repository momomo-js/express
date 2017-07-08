"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mo/core");
const symbol_1 = require("../decoration/symbol");
const co = require("co");
const require_handle_method_1 = require("./router/require-handle.method");
const response_handler_1 = require("./router/response.handler");
class RouterHandler extends core_1.MoApplication {
    constructor() {
        super(...arguments);
        this.app = null;
        this.controllerList = null;
    }
    initController() {
        this.app = this.context.app;
        if (!this.app) {
            throw new Error(`app is null`);
        }
        this.controllerList = this.moServer.routerManager.controllerList;
        for (let controller of this.controllerList) {
            let cPath = Reflect.getMetadata(core_1.PATH, controller);
            for (let member in controller) {
                let method = Reflect.getMetadata(core_1.METHOD, controller, member);
                if (!method)
                    continue;
                let mPath = Reflect.getMetadata(core_1.PATH, controller, member);
                let finalPath = RouterHandler.getFinalPath(cPath, mPath);
                switch (method) {
                    case symbol_1.GET:
                        this.app.get(finalPath, (req, res, next) => {
                            this.run(req, res, next, controller, controller[member]);
                        });
                        break;
                    case symbol_1.POST:
                        this.app.post(finalPath, (req, res, next) => {
                            this.run(req, res, next, controller, controller[member]);
                        });
                        break;
                    case symbol_1.DEL:
                        this.app.delete(finalPath, (req, res, next) => {
                            this.run(req, res, next, controller, controller[member]);
                        });
                        break;
                    case symbol_1.PUT:
                        this.app.put(finalPath, (req, res, next) => {
                            this.run(req, res, next, controller, controller[member]);
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }
    run(req, res, next, cIns, cFun) {
        let p = this;
        co(function* () {
            p._controller(req, res, next, cIns, cFun);
        });
    }
    _controller(req, res, next, cIns, cFun) {
        let p = this;
        co(function* () {
            let respond_data = Reflect.getMetadata(symbol_1.RESPOND, cIns, cFun.name);
            let resHandler = new response_handler_1.ResponseHandler(res, next, respond_data);
            let cFunParams = Reflect.getMetadata(core_1.PARAMS, cIns, cFun.name);
            let params = RouterHandler.paramsDI(cFunParams, resHandler, cIns.modelList, req);
            let ret = yield cFun.apply(cIns, params);
            ret.response();
        });
    }
    static getFinalPath(cPath, mPath) {
        if (mPath == '/')
            return cPath;
        else {
            return cPath + mPath;
        }
    }
    static paramsDI(cFunParams, resHandler, Models, req) {
        let ret = [];
        for (let member of cFunParams) {
            switch (member) {
                case "ResponseHandler":
                    ret.push(resHandler);
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