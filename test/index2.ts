/**
 * Created by yskun on 2017/7/12.
 */

import {Controller, ControllerInterface, Method, MoServer, Plugin, Router} from "@mo/core";
import {ExpressAfterController, ExpressBeforeController, ExpressMiddleware, GET} from "../src/decoration/symbol";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cookies from "cookie-parser";
import * as session from "express-session";
import * as CORS from "cors";
import * as helmet from "helmet";
import {SessionOptions} from "express-session";

import {ExpressServer} from "../src/bin/express-server";
import {ResponseHandler} from "../src/bin/router/response.handler";
import {Express} from "../src/decoration/express";
import * as co from "co";
import e = require("express");
import {CorsOptions} from "cors";
import {IHelmetConfiguration} from "helmet";
class PluginPackage {
    sessionOption: SessionOptions = {
        secret: 'NEXTION_DEFAULT_SESSION',
        cookie: {
            maxAge: 60000 * 20	//20 minutes
        },

        resave: true,
        saveUninitialized: true
    };

    corsOption:CorsOptions = null;

    helmetOption:IHelmetConfiguration = null;

    @Plugin(ExpressMiddleware)
    cors:Function = CORS(this.corsOption);

    @Plugin(ExpressMiddleware)
    helmet:Function = helmet(this.helmetOption);

    @Plugin(ExpressMiddleware)
    logger: Function = logger(process.env.NODE_ENV === 'production' ? 'common' : 'dev');


    @Plugin(ExpressMiddleware)
    bodyParser = bodyParser.json();

    @Plugin(ExpressMiddleware)
    bodyParserUrl = bodyParser.urlencoded({extended: false});

    @Plugin(ExpressMiddleware)
    cookies = cookies();

    @Plugin(ExpressMiddleware)
    session = session(this.sessionOption);

    @Plugin(ExpressBeforeController)
    test(req: e.Request, res: ResponseHandler, cIns: ControllerInterface, cFun: Function): Boolean {
        return co(function *() {
            console.log(`flow ExpressBeforeController`);
            return true;
        });
    }

    @Plugin(ExpressBeforeController)
    test3(req: e.Request, res: ResponseHandler, cIns: ControllerInterface, cFun: Function): Boolean {
        return co(function *() {
            console.log(`flow ExpressBeforeController`);
            return true;
        });
    }

    @Plugin(ExpressAfterController)
    test2(req: e.Request, res: ResponseHandler, cIns: ControllerInterface, cFun: Function): Boolean {
        return co(function *() {
            console.log(`flow ExpressBeforeController`);
            return true;
        });
    }

}

class IndexModel {
    test = 'string';
    haha = 'number';
}

@Controller({
    models: [
        IndexModel
    ],
    path: '/'
})
class IndexController {

    @Method(GET, '/')
    @Express({
        responds: [{
            status: 1,
            message: '完成响应'
        }]
    })
    index(model: IndexModel, res: ResponseHandler): ResponseHandler {
        return co(function *() {
            let q = 1;
            res.status(1).body({
                hahahh: 'hhfehf'
            });
            return res;
        });
    }
}

@Router({
    controllers: [
        IndexController
    ]
})
class IndexRouter {
}


let server = new MoServer();
let express = new ExpressServer();
server.addServer(express);
let p = new PluginPackage();
express.addPlugin(p);
server.routerManager.addRouter(IndexRouter);

server.startSever();
let q = 1;
