import {ExpressBeforeController, GET, POST} from '../src/decoration/symbol';
import {Component, Controller, Instance, Method, Module, MoServer, Plugin, PluginPackage, Router, RouterManager} from '@mo/core';
import {Express} from '../src/decoration/express';
import {ResponseHandler} from '../src/bin/router/response.handler';
import {ArrayType, BODY, Params, PARAMS, Query, QUERY} from '../src/decoration/parameter';
import {ExpressServer} from '../src/bin/express-server';
import {Injectable} from 'injection-js';
import {ControllerFunction} from '../src/bin/function-di';
import {Origin} from '../src/define/origin.class';
import {Type} from '../src/decoration/type';


class IndexModel {
    test = Number;
    haha = Number;
}

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
    async index(model: IndexModel, res: ResponseHandler): Promise<ResponseHandler> {
        res.status(1).body(model);
        return res;
    }

    @Method(POST, '/:ts')
    @Express({
        responds: [{
            status: 1,
            message: '完成响应'
        }]
    })
    post(model: NewIndexModel, res: ResponseHandler, @Type(QUERY, 'yy')username: string): ResponseHandler {
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
class TestComponent extends Component {

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

    onStop(): void {
    }

}

@PluginPackage(ExpressServer)
class TestPluginPackage {
    hahaha = `hahahah`;

    @Plugin(ExpressBeforeController)
    test(origin: Origin, res: ResponseHandler, controllerFunction: ControllerFunction) {
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

MoServer
    .create(TestInstance)
    .then(value => value.startSever());

/**
 * Created by yskun on 2017/7/8.
 */
