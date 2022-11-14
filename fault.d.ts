import { AnyObject, isFunction, isObject, isString } from 'jsc-utils/type';

let id = 1;
export default class Fault extends Error {
    public id: number;
    public name: string;
    public type: string;
    public message: string;

    constructor(message?: string | AnyObject) {
        super();
        this.id = id++;
        this.name = 'Fault';
        this.type = 'Fault';
        this.message = '';

        if (isObject(message)) {
            Object.assign(this, message);
        } else if (isString(message)) {
            this.message = message;
        }

        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (isFunction(Error.captureStackTrace)) Error.captureStackTrace(this, new.target);
    }

    toString(): string {
        return this.message;
    }

    static create<M extends AnyObject = AnyObject>(message?: M): Fault & M {
        return new Fault(message) as Fault & M;
    }
}
