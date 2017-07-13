import * as e from "express";
import {MoBasicServer, State} from "@mo/core";
import {RouterHandler} from "./router-handler";
import {ExpressAfterController, ExpressBeforeController, ExpressMiddleware} from "../decoration/symbol";
import {AfterControllerMethod, BeforeControllerMethod} from "../define/controller-plugin.interface";

export class ExpressServer extends MoBasicServer {

    app: e.Express = null;
    middlewareList: e.RequestHandler[] = [];
    beforeControllerMethodList: BeforeControllerMethod[] = [];
    afterControllerMethodList: AfterControllerMethod[] = [];

    _routerHandler: RouterHandler;

    get routerHandler(): RouterHandler {
        if (!this._routerHandler)
            this._routerHandler = this.loadMoApplication(new RouterHandler());

        return this._routerHandler;
    }

    constructor() {
        super();

    }

    /**
     * 添加中间件
     * @param middleware 中间件
     */
    addMiddleware(...middleware: e.RequestHandler[]) {

        for (let i = 0; i < middleware.length; i++) {
            this.middlewareList.push(middleware[i]);
        }

    }

    /**
     * 装载中间件
     * 将之前保存在middlewareList中的中间件装载至app中
     */
    initMiddleware() {
        this.debug(`init Middleware`);
        if (this.middlewareList) {
            for (let i = 0; i < this.middlewareList.length; i++) {
                this.app.use(this.middlewareList[i]);

            }
        }

        this._state = State.onRun;

    }

    addPlugin(pluginPackageIns: any) {

        this.debug(`add plugin from ${pluginPackageIns.name}` );
        if(pluginPackageIns)
        {
            let ret = ExpressServer.getPlugin(pluginPackageIns,ExpressMiddleware);
            this.addMiddleware(...ret);

            ret = ExpressServer.getPlugin(pluginPackageIns,ExpressBeforeController);
            this.beforeControllerMethodList.push(...ret);

            ret = ExpressServer.getPlugin(pluginPackageIns,ExpressAfterController);
            this.afterControllerMethodList.push(...ret);
        }
    }

    start(): void {
    }

    init(): void {
        this.app = e();

        this.initMiddleware();

        this.routerHandler.initController();
        this.moServer.serverManager.app = this.app;
        this.debug(`init finish`);
    }

}
/**
 * Created by yskun on 2017/7/4.
 */
