import {RouterHandler} from './router-handler';
import {ExpressManager} from './express-manager';
import {Server} from '@mo/core/src/decorator/server';


@Server({
    components: [
        RouterHandler
    ],
    main: ExpressManager
})
export class ExpressServer {
}
