"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e = require("express");
const core_1 = require("@mo/core");
const router_handler_1 = require("./router-handler");
class ExpressServer extends core_1.MoBasicServer {
    constructor() {
        super();
        this.app = null;
        this.middlewareList = null;
    }
    get routerHandler() {
        if (!this._routerHandler)
            this._routerHandler = this.loadMoApplication(new router_handler_1.RouterHandler());
        return this._routerHandler;
    }
    addMiddleware(...middleware) {
        if (!this.middlewareList) {
            this.middlewareList = [];
        }
        for (let i = 0; i < middleware.length; i++) {
            this.middlewareList.push(middleware[i]);
        }
    }
    initMiddleware() {
        if (this.middlewareList) {
            for (let i = 0; i < this.middlewareList.length; i++) {
                this.app.use(this.middlewareList[i]);
            }
        }
        this._state = core_1.State.onRun;
    }
    start() {
    }
    init() {
        this.app = e();
        this.initMiddleware();
        this.routerHandler.initController();
        this.moServer.serverManager.app = this.app;
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=express-server.js.map