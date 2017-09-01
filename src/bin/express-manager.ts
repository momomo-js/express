import * as e from 'express';
import {MoBasicServer, MoServer, MoServerToken, ServerManager, State} from '@mo/core';
import {RouterHandler} from './router-handler';
import {ExpressAfterController, ExpressBeforeController, ExpressMiddleware} from '../decoration/symbol';
import {AfterControllerMethod, BeforeControllerMethod} from '../define/controller-plugin.interface';
import {Inject, Injectable} from 'injection-js';

@Injectable()
export class ExpressManager extends MoBasicServer {
    app: e.Express = null;
    middlewareList: e.RequestHandler[] = [];
    beforeControllerMethodList: BeforeControllerMethod[] = [];
    afterControllerMethodList: AfterControllerMethod[] = [];
    // routerHandler: RouterHandler = new RouterHandler();

    constructor(private serverManager: ServerManager) {
        super();
    }


    onInit(): void {
        super.onInit();
        this.app = e();
        this.initMiddleware();
        this.serverManager.app = this.app;
        this.debug(`init finish`);
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

    }

    addPlugin(pluginPackageIns: any) {

        if (pluginPackageIns) {
            this.debug(`add plugin from ${pluginPackageIns.constructor.name}`);

            let ret = ExpressManager.getPlugin(pluginPackageIns, ExpressMiddleware);
            this.addMiddleware(...ret);

            ret = ExpressManager.getPlugin(pluginPackageIns, ExpressBeforeController);
            this.beforeControllerMethodList.push(...ret);

            ret = ExpressManager.getPlugin(pluginPackageIns, ExpressAfterController);
            this.afterControllerMethodList.push(...ret);
        }
    }

}

/**
 * Created by yskun on 2017/7/4.
 */
