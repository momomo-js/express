"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mime = require("mime");
const path = require("path");
const get_file_cache_1 = require("./get-file-cache");
class ResponseHandler {
    constructor(res, _next, resMessage = null, rootPath = null) {
        this.res = res;
        this._next = _next;
        this.resMessage = resMessage;
        this.rootPath = rootPath;
        this._status = 0;
        this._message = '';
        this._file = '';
        this._mark = false;
    }
    status(status) {
        this._status = status;
        return this;
    }
    message(message) {
        this._message = message;
        return this;
    }
    body(body) {
        this._body = body;
        return this;
    }
    sendFile(file) {
        if (!this.rootPath)
            throw new Error('根目录没有设置，请检查是否为RouterHandler设置了根目录');
        if (this.rootPath.lastIndexOf('/') === 0) {
            this.rootPath.pop();
        }
        if (file.indexOf('/') === 0)
            this._file = this.rootPath + file;
        else
            this._file = this.rootPath + '/' + file;
        return this;
    }
    end() {
        return;
    }
    next(err) {
        this._next(err);
        this._mark = true;
        return this;
    }
    response() {
        let p = this;
        if (this._mark) {
            return;
        }
        if (this._file) {
            get_file_cache_1.getFileCache(this._file, function (err, data) {
                if (data) {
                    p.res.writeHead(200, {
                        'content-type': mime.lookup(path.basename(p._file))
                    });
                    p.res.end(data);
                }
                else {
                    p.res.status(404);
                }
            });
        }
        else {
            if (this.resMessage) {
                for (let i = 0; i < this.resMessage.length; i++) {
                    if (this.resMessage[i].status === this._status) {
                        if (this._message === '') {
                            this._message = this.resMessage[i].message;
                        }
                        break;
                    }
                }
            }
            if (this._status !== 0 && this._message === '') {
                throw new Error('返回状态不为0，但消息为空');
            }
            let resMessage = {
                status: this._status,
                message: this._message,
                body: this._body || null
            };
            this.res.json(resMessage);
        }
    }
}
exports.ResponseHandler = ResponseHandler;
//# sourceMappingURL=response.handler.js.map