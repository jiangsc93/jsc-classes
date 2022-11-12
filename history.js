'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var object = require('./node_modules/jsc-utils/object.js');

const defaults = {
    maxLength: 99
};
const _options = Symbol();
const _list = Symbol();
const _index = Symbol();
class History {
    constructor(options) {
        this[_options] = object.objectMerge({}, defaults, options);
        this[_list] = [];
        this[_index] = -1;
    }
    get index() {
        return this[_index];
    }
    get length() {
        return this[_list].length;
    }
    get canUndo() {
        return this.index > 0 && this.length > 1;
    }
    get canRedo() {
        return this.index < this.length - 1 && this.length > 1;
    }
    /**
     * 获取某一个历史动作
     * @param {number} index
     * @returns {void | T}
     */
    get(index) {
        return this[_list][index];
    }
    /**
     * 推入历史动作
     * @param {T} record
     * @returns {History<T>}
     */
    push(record) {
        this[_list].splice(this.index + 1);
        this[_list].push(record);
        if (this.length > this[_options].maxLength)
            this[_list].shift();
        this[_index] = this.length - 1;
        return this;
    }
    /**
     * 偏移移动
     * @param {number} offset
     * @returns {void | T}
     */
    move(offset) {
        const to = this[_index] + offset;
        return this.goto(to);
    }
    /**
     * 前往指定记录点
     * @param {number} to
     * @returns {void | T}
     */
    goto(to) {
        // 没有记录点
        if (this.length === 0)
            return;
        const record = this[_list][to];
        if (!record)
            return;
        this[_index] = to;
        return record;
    }
    /**
     * 前往开始记录点
     * @returns {void | T}
     */
    toStart() {
        return this.goto(0);
    }
    /**
     * 前往结束记录点
     * @returns {void | T}
     */
    toEnd() {
        return this.goto(this.length - 1);
    }
    /**
     * 撤销
     * @returns {void | T}
     */
    undo() {
        if (!this.canUndo)
            return;
        this[_index]--;
        return this[_list][this.index];
    }
    /**
     * 重做
     * @returns {void | T}
     */
    redo() {
        if (!this.canRedo)
            return;
        this[_index]++;
        return this[_list][this.index];
    }
}

exports["default"] = History;
exports.defaults = defaults;
