import {Request, Response} from 'express';

export class Origin {

    constructor(public request: Request, public  response: Response) {
    }
}

/**
 * Created by yskun on 2017/7/16.
 */
