import {RouterHandler} from './core/router-handler';
import {ExpressManager} from './core/express-manager';
import {Server} from '@mo/core/src/decorator/server';


@Server({
    components: [
        RouterHandler
    ],
    main: ExpressManager
})
export class ExpressServer {
}
