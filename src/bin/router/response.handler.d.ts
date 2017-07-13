/// <reference types="express" />
import e = require("express");
import { ResMessage } from "../../define/res-message.interface";
export declare class ResponseHandler {
    private res;
    private _next;
    private resMessage;
    private rootPath;
    constructor(res: e.Response, _next: e.NextFunction, resMessage?: ResMessage[], rootPath?: any);
    private _status;
    private _message;
    private _body;
    private _file;
    private _mark;
    status(status: number): ResponseHandler;
    message(message: string): ResponseHandler;
    body(body: object): ResponseHandler;
    sendFile(file: string): ResponseHandler;
    end(): void;
    next(err?: any): ResponseHandler;
    response(): void;
}
