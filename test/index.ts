import {GET, POST} from '../src/decoration/symbol';
import {Component, Controller, Instance, Method, Module, MoServer, Router, RouterManager} from '@mo/core';
import {Express} from '../src/decoration/express';
import {ResponseHandler} from '../src/bin/router/response.handler';
import {ArrayType, Param, Query} from '../src/decoration/parameter';
import {ExpressServer} from '../src/bin/mo-express-server';
import {Injectable} from 'injection-js';
import {ExpressDefaultPluginPackage} from '@mo/express-default-module';


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
    post(model: NewIndexModel, res: ResponseHandler): ResponseHandler {
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

@Module({
    plugins: [],
    components: [TestComponent]
})
class TestModule {
}


@Instance({
    servers: [ExpressServer],
    modules: [TestModule, TestModule],
    routers: [IndexRouter],
    components: [TestComponent, TestComponent],
    instance: {
        name: 'TEST',
        host: 'localhost',
        port: 3000
    }
})
class TestInstance {
}

new MoServer(TestInstance).startSever().then();

/**
 * Created by yskun on 2017/7/8.
 */
