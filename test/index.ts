import {ExpressServer} from "../src/bin/express-server";
import {GET, POST} from "../src/decoration/symbol";
import {Controller, Method, MoServer, Router} from "@mo/core";
import {Express} from "../src/decoration/express";
import {ResponseHandler} from "../src/bin/router/response.handler";
import * as co from "co";
import {ArrayType, Body, Param, Query} from "../src/decoration/parameter";
import {ExpressDefaultPluginPackage} from "@mo/express-default-module";

let server: MoServer = new MoServer('Hello', 3000);
let express: ExpressServer = new ExpressServer();


class IndexModel {
    test = Number;
    haha = Number;
}

class NewIndexModel {
    @Query
    @ArrayType(Number)
    test: number[];

    @Param
    ts: number;

    @Query
    yy: number;
}


@Controller({
    models: [
        IndexModel,
        NewIndexModel
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
        return co(function* () {
            res.status(1).body(model);
            return res;
        });
    }

    @Method(POST, '/:ts')
    @Express({
        responds: [{
            status: 1,
            message: '完成响应'
        }]
    })
    post(model: NewIndexModel, res: ResponseHandler): ResponseHandler {
        return co(function* () {
            res.status(1).body(model);
        })
    }
}

@Router({
    controllers: [
        IndexController
    ]
})
class IndexRouter {
}


server.addServer(express);
express.addPlugin(new ExpressDefaultPluginPackage());

server.routerManager.addRouter([IndexRouter]);

server.startSever();

/**
 * Created by yskun on 2017/7/8.
 */
