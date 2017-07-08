import {ExpressServer} from "../src/bin/express-server";
import {GET} from "../src/decoration/symbol";
import {Controller, Method, MoServer, Router} from "@mo/core";
import {Express} from "../src/decoration/express";
import {ResponseHandler} from "../src/bin/router/response.handler";
import * as co from "co";
let server: MoServer = new MoServer('Hello',3000);
let express: ExpressServer = new ExpressServer();

class IndexModel {
    test: string;
    haha: string;
}

@Controller({
    models: [
        IndexModel
    ],
    path:'/'
})
class IndexController {

    @Method(GET,'/')
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
                hahahh:'hhfehf'
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


server.addServer(express);

server.routerManager.addRouter(IndexRouter);

server.startSever();

/**
 * Created by yskun on 2017/7/8.
 */
