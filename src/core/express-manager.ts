import * as e from 'express';
import {MoServerPlugin, ServerManager, MoBasic, OnInit, getMoPlugin} from '@mo/core';
import {ExpressAfterController, ExpressBeforeController, ExpressMiddleware} from '../decorator/symbol';
import {Injectable} from "injection-js";

@Injectable()
export class ExpressManager extends MoBasic implements MoServerPlugin, OnInit {
    app: e.Express = null;
    middlewareList: e.RequestHandler[] = [];
    beforeControllerMethodList: [any, any][] = [];
    afterControllerMethodList: [any, any][] = [];

    constructor(private serverManager: ServerManager) {
        super();
    }

    onInit(): void {
        this.app = e();
        this.initMiddleware();
        this.serverManager.app = this.app;
    }

    /**
     * 添加中间件
     * @param middleware 中间件
     */
    addMiddleware(middleware: e.RequestHandler[]) {
        this.middlewareList.push.apply(this.middlewareList, middleware);
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

            let ret = getMoPlugin(pluginPackageIns, ExpressMiddleware);
            this.addMiddleware(ret);

            ret = getMoPlugin(pluginPackageIns, ExpressBeforeController);
            ret.forEach(value => {
                this.beforeControllerMethodList.push([pluginPackageIns, value]);
            });

            ret = getMoPlugin(pluginPackageIns, ExpressAfterController);
            ret.forEach(value => {
                this.afterControllerMethodList.push([pluginPackageIns, value]);
            });
        }
    }

}

/**
 * Created by yskun on 2017/7/4.
 */
