/// <reference types="express" />
import { ControllerInterface, MoApplication } from "@mo/core";
import { ResponseHandler } from "./router/response.handler";
import e = require("express");
export declare class RouterHandler extends MoApplication {
    app: e.Express;
    controllerList: ControllerInterface[];
    initController(): void;
    run(req: e.Request, res: e.Response, next: e.NextFunction, cIns: ControllerInterface, cFun: Function): void;
    _controller(req: e.Request, res: e.Response, next: e.NextFunction, cIns: ControllerInterface, cFun: Function): void;
    private static getFinalPath(cPath, mPath);
    static paramsDI(cFunParams: String[], resHandler: ResponseHandler, Models: Map<String, Object>, req: e.Request): Object[];
}
