/// <reference types="express" />
import { IController, MoApplication } from "@mo/core";
import { ExpressServer } from "./express-server";
import { ResponseHandler } from "./router/response.handler";
import e = require("express");
export declare class RouterHandler extends MoApplication {
    app: e.Express;
    controllerList: IController[];
    express: ExpressServer;
    initController(): void;
    run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: IController, cFun: Function): void;
    _controller(req: e.Request, resHandler: ResponseHandler, cIns: IController, cFun: Function): ResponseHandler;
    private static getFinalPath(cPath, mPath);
    static paramsDI(cFunParams: String[], resHandler: ResponseHandler, Models: Map<String, Object>, req: e.Request): Object[];
}
