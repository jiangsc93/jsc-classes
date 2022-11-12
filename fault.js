'use strict';

var type = require('./node_modules/jsc-utils/type.js');

let id = 1;
class Fault extends Error {
    constructor(message) {
        super();
        this.id = id++;
        this.name = 'Fault';
        this.type = 'Fault';
        this.message = '';
        if (type.type.isObject(message)) {
            Object.assign(this, message);
        }
        else if (type.type.isString(message)) {
            this.message = message;
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (type.type.isFunction(Error.captureStackTrace))
            Error.captureStackTrace(this, new.target);
    }
    toString() {
        return this.message;
    }
    static create(message) {
        return new Fault(message);
    }
}

module.exports = Fault;
