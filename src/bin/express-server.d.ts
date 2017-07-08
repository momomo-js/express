/// <reference types="express" />
import * as e from "express";
import { MoBasicServer } from "@mo/core";
import { RouterHandler } from "./router-handler";
export declare class ExpressServer extends MoBasicServer {
    app: e.Express;
    middlewareList: e.RequestHandler[];
    _routerHandler: RouterHandler;
    readonly routerHandler: RouterHandler;
    constructor();
    addMiddleware(...middleware: e.RequestHandler[]): void;
    initMiddleware(): void;
    start(): void;
    init(): void;
}
