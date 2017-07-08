import * as e from "express";
import {MoBasicServer, State} from "@mo/core";
import {RouterHandler} from "./router-handler";

export class ExpressServer extends MoBasicServer {

    app: e.Express = null;
    middlewareList: e.RequestHandler[] = null;
    routerHandler: RouterHandler;

    constructor()
    {
        super();
        this.routerHandler = this.loadMoApplication(new RouterHandler());
        
    }
    /**
     * 添加中间件
     * @param middleware 中间件
     */
    addMiddleware(...middleware: e.RequestHandler[]) {
        if (!this.middlewareList) {
            this.middlewareList = [];
        }

        for (let i = 0; i < middleware.length; i++) {
            this.middlewareList.push(middleware[i]);
        }

    }

    /**
     * 装载中间件
     * 将之前保存在middlewareList中的中间件装载至app中
     */
    initMiddleware() {
        if (this.middlewareList) {
            for (let i = 0; i < this.middlewareList.length; i++) {
                this.app.use(this.middlewareList[i]);
                
            }
        }

        this._state = State.onRun;

    }


    start(): void {
    }

    init(): void {
        this.app = e();
        this.initMiddleware();
        this.routerHandler.initController();
        this.moServer.serverManager.app = this.app;
    }

}
/**
 * Created by yskun on 2017/7/4.
 */
