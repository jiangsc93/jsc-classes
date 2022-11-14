import { isObject, isString, isFunction } from 'jsc-utils/type';

let id = 1;
class Fault extends Error {
    constructor(message) {
        super();
        this.id = id++;
        this.name = 'Fault';
        this.type = 'Fault';
        this.message = '';
        if (isObject(message)) {
            Object.assign(this, message);
        }
        else if (isString(message)) {
            this.message = message;
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (isFunction(Error.captureStackTrace))
            Error.captureStackTrace(this, new.target);
    }
    toString() {
        return this.message;
    }
    static create(message) {
        return new Fault(message);
    }
}

export { Fault as default };
