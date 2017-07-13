/// <reference types="express" />
import { ResponseHandler } from "../bin/router/response.handler";
import { ControllerInterface } from "@mo/core";
import e = require("express");
export interface BeforeControllerMethod {
    (req: e.Request, res: ResponseHandler, cIns: ControllerInterface, cFun: Function): Boolean;
}
export interface AfterControllerMethod {
    (res: ResponseHandler, cIns: ControllerInterface, cFun: Function): Boolean;
}
