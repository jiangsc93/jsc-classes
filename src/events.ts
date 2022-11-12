import { arrayEach, arrayRemove } from 'jsc-utils/array';
import { objectAssign } from 'jsc-utils/object';
import { AnyArray, AnyFunc, AnyObject, isFunction, isNull, isString, isUndefined } from 'jsc-utils/type';

export type EventsType = string | symbol;
const GLOBAL_EVENTS_TYPE = Symbol();

export type EventsListener = AnyFunc;
export type EventsStore = {
    [type in EventsType]: EventsListener[];
};
export interface EventsPiper {
    next: Events;
    namespace?: string;
}
export interface EventsOptions {
    // 单信道监听上限，默认为 99
    maxLength: number;
    // 事件命名空间，默认为“:”
    delimiter: string;
    // 信道消息是否目标优先，默认 false
    // 源头优先（默认）：有 a、b 两个信道，a 设置了来源为 c，b 设置了目标为 a，则 b 是无法发送事件消息给 a 的
    // 目标优先：如上情况，则 b 是可以发送事件消息给 a 的
    targetFirst: boolean;
}
export const eventsDefaults: EventsOptions = {
    maxLength: 99,
    delimiter: ':',
    targetFirst: false
};

export type ChannelId = string | number | symbol | bigint | AnyObject | AnyArray | AnyFunc;
export interface EventsChannelOptions {
    // 信道接收源头，如果信道源头的显式的信道目标不是当前信道，则不会受到事件消息
    source: ChannelId;
    // 信道发送目标
    target: ChannelId;
    // 是否将发出通道事件扩展到主事件系统，默认 false
    extend: boolean;
    // 是否继承主事件系统接收到的主事件，默认 false
    inherit: boolean;
}

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

export default class Events {
    private [_options]: EventsOptions;
    private [_eventsStore]: EventsStore;
    private [_eventsPipeList]: EventsPiper[];
    private [_eventsChannelList]: Events[];
    id: any;
    source: any;
    target: any;
    extend: boolean;
    inherit: boolean;
    parent: null | Events;

    constructor(options?: Partial<EventsOptions>) {
        this[_options] = objectAssign<EventsOptions>({}, eventsDefaults, options);
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
    public on(type: EventsType | EventsListener, listener?: EventsListener): Events {
        let _type: EventsType;
        let _listener: EventsListener;

        if (isFunction(type)) {
            _listener = type;
            _type = GLOBAL_EVENTS_TYPE;
        } else {
            _type = type;
            _listener = listener as EventsListener;
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
    public once(type: EventsType, listener: EventsListener): Events {
        const _listener = (...payloads: AnyArray) => {
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
    public off(type?: EventsType, listener?: EventsListener): Events {
        if (isString(type) && isFunction(listener)) this[_offOne](type, listener);
        else if (isString(type)) this[_offBatch](type);
        else this[_offAll]();

        return this;
    }

    private [_offOne](type: EventsType, listener: EventsListener): void {
        const store = this[_getStoreByType](type);
        arrayRemove(store, (val) => val === listener);
    }

    private [_offBatch](type: EventsType): void {
        delete this[_eventsStore][type as string];
    }

    private [_offAll](): void {
        this[_eventsStore] = {};
    }

    /**
     * 触发事件
     * @param {EventsType} type
     * @param {any} payloads
     * @returns {Events}
     */
    public emit(type: EventsType, ...payloads: AnyArray): Events {
        // 只有在没有父级的时候才会传递给自身
        if (this.parent === null) this[_dispatchType](true, type, ...payloads);

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
    private [_dispatchType](pipable: boolean, type: EventsType, ...payloads: AnyArray): void {
        const store = this[_getStoreByType](type);
        const { delimiter } = this[_options];

        arrayEach(store.slice(), (listener) => {
            if (pipable) {
                // 事件传递
                arrayEach(this[_eventsPipeList].slice(), (piper) => {
                    const { next, namespace = '' } = piper;
                    const ns = [type];

                    if (namespace) ns.unshift(namespace);

                    const nextType = ns.join(delimiter);

                    next.emit(nextType, ...payloads);
                });
            }

            if (listener.call(this, ...payloads) === false) return false;
        });
    }

    /**
     * 事件传递
     * @param {this} next
     * @param {string} namespace
     * @returns {Events}
     */
    public pipe(next: Events, namespace?: string): Events {
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
    createChannel(id: ChannelId, options?: Partial<EventsChannelOptions>): Events {
        if (this.parent) {
            throw new Error('信道实例不能再创建新的信道');
        }

        const { source, target, extend = false, inherit = false } = objectAssign<EventsChannelOptions>({}, options);

        if (id === source) {
            throw new Error('当前信道 id 不能和源头信道 id 相等');
        }

        if (id === target) {
            throw new Error('当前信道 id 不能和目标信道 id 相等');
        }

        const { maxLength } = this[_options];
        const eventsOptions: Partial<EventsOptions> = { maxLength };
        const channel = new Events(eventsOptions);
        channel.id = id;
        channel.source = source;
        channel.target = target;
        channel.extend = extend;
        channel.inherit = inherit;
        channel.parent = this;
        channel.on((type: EventsType, ...payloads: AnyArray) => {
            if (channel.extend) this[_dispatchType](false, type, ...payloads);
            this[_dispatchChannel](channel, type, ...payloads);
        });
        this.on((type: EventsType, ...payloads: AnyArray) => {
            if (channel.inherit) channel[_dispatchType](false, type, ...payloads);
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
    private [_dispatchChannel](imcommingChannel: Events, type: EventsType, ...payloads: AnyArray): void {
        const { targetFirst } = this[_options];
        const { id, target } = imcommingChannel;
        const isEmpty = (any: unknown): boolean => isNull(any) || isUndefined(any);

        this[_eventsChannelList].forEach((outgoingChannel) => {
            // 来信道为自身信道：不会收到信道消息
            if (outgoingChannel.id === id) return;

            // 来信道未指定了目标信道：可以广播给所有去信道
            if (isEmpty(target)) {
                // 去信道未指定源头信道：可以接收任意来信道
                if (isEmpty(outgoingChannel.source)) {
                    outgoingChannel[_dispatchType](false, type, ...payloads);
                }
                // 去信道指定了源头信道：可以接收指定来信道
                else if (outgoingChannel.source === id) {
                    outgoingChannel[_dispatchType](false, type, ...payloads);
                }
            }
            // 来信道指定了目标信道：只能发给指定去信道
            else if (target === outgoingChannel.id) {
                const { source: outgoingSource } = outgoingChannel;

                // 如果目标信道与源信道指定的目标信道不一致，则拒绝发送
                // 也就是说 source 优先级 > target 优先级
                if (!isEmpty(outgoingSource) && outgoingSource !== target && !targetFirst) return;

                outgoingChannel[_dispatchType](false, type, ...payloads);
            }
        });
    }

    public destroy(): void {
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

    private [_getStoreByType](type: EventsType): EventsListener[] {
        const eventsStore = this[_eventsStore];
        const { [type as string]: store = [] } = eventsStore;
        eventsStore[type as string] = store;

        return store;
    }
}
