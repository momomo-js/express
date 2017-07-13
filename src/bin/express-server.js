"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e = require("express");
const core_1 = require("@mo/core");
const router_handler_1 = require("./router-handler");
const symbol_1 = require("../decoration/symbol");
class ExpressServer extends core_1.MoBasicServer {
    constructor() {
        super();
        this.app = null;
        this.middlewareList = [];
        this.beforeControllerMethodList = [];
        this.afterControllerMethodList = [];
    }
    get routerHandler() {
        if (!this._routerHandler)
            this._routerHandler = this.loadMoApplication(new router_handler_1.RouterHandler());
        return this._routerHandler;
    }
    addMiddleware(...middleware) {
        for (let i = 0; i < middleware.length; i++) {
            this.middlewareList.push(middleware[i]);
        }
    }
    initMiddleware() {
        this.debug(`init Middleware`);
        if (this.middlewareList) {
            for (let i = 0; i < this.middlewareList.length; i++) {
                this.app.use(this.middlewareList[i]);
            }
        }
        this._state = core_1.State.onRun;
    }
    addPlugin(pluginPackageIns) {
        this.debug(`add plugin from ${pluginPackageIns.name}`);
        if (pluginPackageIns) {
            let ret = ExpressServer.getPlugin(pluginPackageIns, symbol_1.ExpressMiddleware);
            this.addMiddleware(...ret);
            ret = ExpressServer.getPlugin(pluginPackageIns, symbol_1.ExpressBeforeController);
            this.beforeControllerMethodList.push(...ret);
            ret = ExpressServer.getPlugin(pluginPackageIns, symbol_1.ExpressAfterController);
            this.afterControllerMethodList.push(...ret);
        }
    }
    start() {
    }
    init() {
        this.app = e();
        this.initMiddleware();
        this.routerHandler.initController();
        this.moServer.serverManager.app = this.app;
        this.debug(`init finish`);
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=express-server.js.map