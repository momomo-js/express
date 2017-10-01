import {ExpressBeforeController, GET, POST} from '../src/decorator/symbol';
import {
    Controller,
    Instance,
    Method, Mo, MoBasic, OnInit, OnStart,
    Plugin,
    PluginPackage,
    Router,
    RouterManager,
    Type
} from '@mo/core';
import {Express} from '../src/decorator/express';
import {ResponseHandler} from '../src/router-util/response.handler';
import {ArrayType, Params, Query, QUERY} from '../src/decorator/parameter';
import {Injectable} from 'injection-js';
import {CFunc} from '../src/define/c-func.class';
import {Origin} from '../src/define/origin.class';
import {ExpressServer} from "../src/express-server";
import {Require} from "../src/decorator/require";

class NewIndexModel {
    @Query
    @ArrayType(Number)
    test: number[];

    @Params
    ts: number;

    @Query
    yy: number;
}


@Controller({
    models: [
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
    async index(res: ResponseHandler): Promise<ResponseHandler> {
        return res;
    }

    @Method(POST, '/:ts')
    @Express({
        responds: [{
            status: 1,
            message: '完成响应'
        }]
    })
    post(model: NewIndexModel, res: ResponseHandler,@Require @Type(QUERY, 'yy')  username: number): ResponseHandler {
        console.log(username);
        res.status(1).body(model);
        return res;
    }
}

@Router({
    controllers: [
        IndexController
    ]
})
class IndexRouter {
}

@Injectable()
class TestComponent extends MoBasic implements OnStart, OnInit {

    constructor(public router: RouterManager) {
        super();
    }

    onInit(): void {
        this.debug(`testing onInit...`);
        this.debug(`${this.router.constructor.name}`)
    }

    onStart(): void {
        this.debug(`testing onStart...`);

    }

}

@PluginPackage(ExpressServer)
class TestPluginPackage {
    hahaha = `hahahah`;

    @Plugin(ExpressBeforeController)
    test(origin: Origin, res: ResponseHandler, controllerFunction: CFunc) {
        console.log(this.hahaha);
    }

}

@Instance({
    servers: [ExpressServer],
    routers: [IndexRouter],
    plugins: [TestPluginPackage],
    instance: {
        name: 'TEST',
        host: 'localhost',
        port: 3000
    }
})
class TestInstance {
}

Mo
    .create(TestInstance)
    .then(value => value.startSever());

/**
 * Created by yskun on 2017/7/8.
 */
