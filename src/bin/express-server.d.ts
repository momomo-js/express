/// <reference types="express" />
import * as e from "express";
import { MoBasicServer } from "@mo/core";
import { RouterHandler } from "./router-handler";
import { AfterControllerMethod, BeforeControllerMethod } from "../define/controller-plugin.interface";
export declare class ExpressServer extends MoBasicServer {
    app: e.Express;
    middlewareList: e.RequestHandler[];
    beforeControllerMethodList: BeforeControllerMethod[];
    afterControllerMethodList: AfterControllerMethod[];
    _routerHandler: RouterHandler;
    readonly routerHandler: RouterHandler;
    constructor();
    addMiddleware(...middleware: e.RequestHandler[]): void;
    initMiddleware(): void;
    addPlugin(pluginPackageIns: any): void;
    start(): void;
    init(): void;
}
