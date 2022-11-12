import { arrayRemove as arrayRemove_1, arrayEach as arrayEach_1 } from './node_modules/jsc-utils/array.mjs';
import { objectAssign as objectAssign_1 } from './node_modules/jsc-utils/object.mjs';
import { t as type } from './node_modules/jsc-utils/type.mjs';

const GLOBAL_EVENTS_TYPE = Symbol();
const eventsDefaults = {
    maxLength: 99,
    delimiter: ':',
    targetFirst: false
};
const _options = Symbol();
const _eventsStore = Symbol();
const _eventsPipeList = Symbol();
const _eventsChannelList = Symbol();
const _getStoreByType = Symbol();
const _offOne = Symbol();
const _offBatch = Symbol();
const _offAll = Symbol();
const _dispatchType = Symbol();
const _dispatchChannel = Symbol();
class Events {
    constructor(options) {
        this[_options] = objectAssign_1({}, eventsDefaults, options);
        this[_eventsStore] = {};
        this[_eventsPipeList] = [];
        this[_eventsChannelList] = [];
        this.id = undefined;
        this.source = undefined;
        this.target = undefined;
        this.extend = false;
        this.inherit = false;
        this.parent = null;
    }
    /**
     * 添加事件监听
     * @param {EventsType | EventsListener} type
     * @param {EventsListener} listener
     * @returns {Events}
     */
    on(type$1, listener) {
        let _type;
        let _listener;
        if (type.isFunction(type$1)) {
            _listener = type$1;
            _type = GLOBAL_EVENTS_TYPE;
        }
        else {
            _type = type$1;
            _listener = listener;
        }
        const store = this[_getStoreByType](_type);
        const { maxLength } = this[_options];
        if (store.length === maxLength) {
            throw new Error(`同一个通道的事件监听数量不能超过 ${maxLength} 个`);
        }
        store.push(_listener);
        return this;
    }
    /**
     * 一次性事件监听
     * @param {EventsType} type
     * @param {EventsListener} listener
     * @returns {Events}
     */
    once(type, listener) {
        const _listener = (...payloads) => {
            this.off(type, _listener);
            listener.call(this, ...payloads);
        };
        return this.on(type, _listener);
    }
    /**
     * 解除事件监听
     * @param {EventsType} type
     * @param {EventsListener} listener
     * @returns {Events}
     */
    off(type$1, listener) {
        if (type.isString(type$1) && type.isFunction(listener))
            this[_offOne](type$1, listener);
        else if (type.isString(type$1))
            this[_offBatch](type$1);
        else
            this[_offAll]();
        return this;
    }
    [_offOne](type, listener) {
        const store = this[_getStoreByType](type);
        arrayRemove_1(store, (val) => val === listener);
    }
    [_offBatch](type) {
        delete this[_eventsStore][type];
    }
    [_offAll]() {
        this[_eventsStore] = {};
    }
    /**
     * 触发事件
     * @param {EventsType} type
     * @param {any} payloads
     * @returns {Events}
     */
    emit(type, ...payloads) {
        // 只有在没有父级的时候才会传递给自身
        if (this.parent === null)
            this[_dispatchType](true, type, ...payloads);
        this[_dispatchType](false, GLOBAL_EVENTS_TYPE, type, ...payloads);
        return this;
    }
    /**
     * 事件类型分发
     * @param {boolean} pipable
     * @param {EventsType} type
     * @param {any} payloads
     * @private
     */
    [_dispatchType](pipable, type, ...payloads) {
        const store = this[_getStoreByType](type);
        const { delimiter } = this[_options];
        arrayEach_1(store.slice(), (listener) => {
            if (pipable) {
                // 事件传递
                arrayEach_1(this[_eventsPipeList].slice(), (piper) => {
                    const { next, namespace = '' } = piper;
                    const ns = [type];
                    if (namespace)
                        ns.unshift(namespace);
                    const nextType = ns.join(delimiter);
                    next.emit(nextType, ...payloads);
                });
            }
            if (listener.call(this, ...payloads) === false)
                return false;
        });
    }
    /**
     * 事件传递
     * @param {this} next
     * @param {string} namespace
     * @returns {Events}
     */
    pipe(next, namespace) {
        this[_eventsPipeList].push({
            next,
            namespace
        });
        return this;
    }
    /**
     * 创建信道
     * @example
     * ```js
     * const events = new Events();
     * const c1 = events.createChannel('x');
     * const c2 = events.createChannel('y');
     * c1.on('a', (n) => console.log(n)); // n = 2
     * c2.on('a', (n) => console.log(n)); // n = 1
     * c1.emit('a', 1);
     * c2.emit('a', 2);
     * ```
     * @param id
     * @param {Partial<EventsChannelOptions>} options
     * @returns {Events}
     */
    createChannel(id, options) {
        if (this.parent) {
            throw new Error('信道实例不能再创建新的信道');
        }
        const { source, target, extend = false, inherit = false } = objectAssign_1({}, options);
        if (id === source) {
            throw new Error('当前信道 id 不能和源头信道 id 相等');
        }
        if (id === target) {
            throw new Error('当前信道 id 不能和目标信道 id 相等');
        }
        const { maxLength } = this[_options];
        const eventsOptions = { maxLength };
        const channel = new Events(eventsOptions);
        channel.id = id;
        channel.source = source;
        channel.target = target;
        channel.extend = extend;
        channel.inherit = inherit;
        channel.parent = this;
        channel.on((type, ...payloads) => {
            if (channel.extend)
                this[_dispatchType](false, type, ...payloads);
            this[_dispatchChannel](channel, type, ...payloads);
        });
        this.on((type, ...payloads) => {
            if (channel.inherit)
                channel[_dispatchType](false, type, ...payloads);
        });
        this[_eventsChannelList].push(channel);
        return channel;
    }
    /**
     * 事件信道分发
     * @param imcommingChannel
     * @param {EventsType} type
     * @param {any} payloads
     * @private
     */
    [_dispatchChannel](imcommingChannel, type$1, ...payloads) {
        const { targetFirst } = this[_options];
        const { id, target } = imcommingChannel;
        const isEmpty = (any) => type.isNull(any) || type.isUndefined(any);
        this[_eventsChannelList].forEach((outgoingChannel) => {
            // 来信道为自身信道：不会收到信道消息
            if (outgoingChannel.id === id)
                return;
            // 来信道未指定了目标信道：可以广播给所有去信道
            if (isEmpty(target)) {
                // 去信道未指定源头信道：可以接收任意来信道
                if (isEmpty(outgoingChannel.source)) {
                    outgoingChannel[_dispatchType](false, type$1, ...payloads);
                }
                // 去信道指定了源头信道：可以接收指定来信道
                else if (outgoingChannel.source === id) {
                    outgoingChannel[_dispatchType](false, type$1, ...payloads);
                }
            }
            // 来信道指定了目标信道：只能发给指定去信道
            else if (target === outgoingChannel.id) {
                const { source: outgoingSource } = outgoingChannel;
                // 如果目标信道与源信道指定的目标信道不一致，则拒绝发送
                // 也就是说 source 优先级 > target 优先级
                if (!isEmpty(outgoingSource) && outgoingSource !== target && !targetFirst)
                    return;
                outgoingChannel[_dispatchType](false, type$1, ...payloads);
            }
        });
    }
    destroy() {
        this.off();
        this[_eventsChannelList].forEach((ev) => ev.destroy());
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this[_eventsStore] = null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this[_eventsChannelList] = null;
        this.source = null;
        this.target = null;
        this.parent = null;
    }
    [_getStoreByType](type) {
        const eventsStore = this[_eventsStore];
        const { [type]: store = [] } = eventsStore;
        eventsStore[type] = store;
        return store;
    }
}

export { Events as default, eventsDefaults };
