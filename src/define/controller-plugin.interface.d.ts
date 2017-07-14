/// <reference types="express" />
import { ResponseHandler } from "../bin/router/response.handler";
import { IController } from "@mo/core";
import e = require("express");
export interface BeforeControllerMethod {
    (req: e.Request, res: ResponseHandler, cIns: IController, cFun: Function): Boolean;
}
export interface AfterControllerMethod {
    (res: ResponseHandler, cIns: IController, cFun: Function): Boolean;
}
