import { arrayRemove } from 'jsc-utils/array';
import { objectMerge } from 'jsc-utils/object';
import { isString } from 'jsc-utils/type';

/**
 * 键盘快捷键类
 * @ref https://github.com/RobertWHurst/KeyboardJS
 */
//=========================
// environment
//=========================
const { userAgent } = navigator;
const isMac = /Mac/i.test(userAgent);
const isSafari = /Safari/i.test(userAgent);
const isChrome = /Chrome/i.test(userAgent);
const isOpera = /Opera/i.test(userAgent);
const isFirefox = /Firefox/i.test(userAgent);
const o = () => Object.create(null);
const KEY_BIND_STR = '+';
const KEY_COMBO_STR = ':';
const keyCodeNamesMap = o();
const keyNameCodeMap = o();
const bindKeyCode = (keyCode, keyNames) => {
    keyCodeNamesMap[keyCode] = keyNames;
    keyNames.forEach((keyName) => {
        keyNameCodeMap[keyName] = keyCode;
    });
};
// general
bindKeyCode(3, ['cancel']);
bindKeyCode(8, ['backspace', '⌫']);
bindKeyCode(9, ['tab', '↹']);
bindKeyCode(12, ['clear']);
bindKeyCode(13, ['enter', 'return', '↩︎', '↩', '↵', '⏎']);
bindKeyCode(19, ['pause', 'break']);
bindKeyCode(20, ['capslock']);
bindKeyCode(27, ['escape', 'esc', '⎋']);
bindKeyCode(32, ['space', 'spacebar']);
bindKeyCode(33, ['pageup']);
bindKeyCode(34, ['pagedown']);
bindKeyCode(35, ['end']);
bindKeyCode(36, ['home']);
bindKeyCode(37, ['left', '←']);
bindKeyCode(38, ['up', '↑']);
bindKeyCode(39, ['right', '→']);
bindKeyCode(40, ['down', '↓']);
bindKeyCode(41, ['select']);
bindKeyCode(42, ['printscreen']);
bindKeyCode(43, ['execute']);
bindKeyCode(44, ['snapshot']);
bindKeyCode(45, ['insert', 'ins']);
bindKeyCode(46, ['delete', 'del']);
bindKeyCode(47, ['help']);
bindKeyCode(145, ['scrolllock', 'scroll']);
bindKeyCode(188, ['comma', ',', '<']);
bindKeyCode(190, ['period', '.', '>']);
bindKeyCode(191, ['slash', 'forwardslash', '/', '?']);
bindKeyCode(192, ['graveaccent', '`', '~']);
bindKeyCode(219, ['openbracket', '[', '{']);
bindKeyCode(220, ['backslash', '\\', '|']);
bindKeyCode(221, ['closebracket', ']', '}']);
bindKeyCode(222, ['apostrophe', "'", '"']);
// 0-9
bindKeyCode(48, ['zero', '0', ')']);
bindKeyCode(49, ['one', '1', '!']);
bindKeyCode(50, ['two', '2', '@']);
bindKeyCode(51, ['three', '3', '#']);
bindKeyCode(52, ['four', '4', '$']);
bindKeyCode(53, ['five', '5', '%']);
bindKeyCode(54, ['six', '6', '^']);
bindKeyCode(55, ['seven', '7', '&']);
bindKeyCode(56, ['eight', '8', '*']);
bindKeyCode(57, ['nine', '9', '(']);
// numpad
bindKeyCode(96, ['numzero', 'num0']);
bindKeyCode(97, ['numone', 'num1']);
bindKeyCode(98, ['numtwo', 'num2']);
bindKeyCode(99, ['numthree', 'num3']);
bindKeyCode(100, ['numfour', 'num4']);
bindKeyCode(101, ['numfive', 'num5']);
bindKeyCode(102, ['numsix', 'num6']);
bindKeyCode(103, ['numseven', 'num7']);
bindKeyCode(104, ['numeight', 'num8']);
bindKeyCode(105, ['numnine', 'num9']);
bindKeyCode(106, ['nummultiply', 'num*']);
bindKeyCode(107, ['numadd', 'num+']);
bindKeyCode(108, ['numenter', 'numreturn']);
bindKeyCode(109, ['numsubtract', 'num-']);
bindKeyCode(110, ['numdecimal', 'num.']);
bindKeyCode(111, ['numdivide', 'num/']);
bindKeyCode(144, ['numlock', 'num']);
// function keys
bindKeyCode(112, ['f1']);
bindKeyCode(113, ['f2']);
bindKeyCode(114, ['f3']);
bindKeyCode(115, ['f4']);
bindKeyCode(116, ['f5']);
bindKeyCode(117, ['f6']);
bindKeyCode(118, ['f7']);
bindKeyCode(119, ['f8']);
bindKeyCode(120, ['f9']);
bindKeyCode(121, ['f10']);
bindKeyCode(122, ['f11']);
bindKeyCode(123, ['f12']);
bindKeyCode(124, ['f13']);
bindKeyCode(125, ['f14']);
bindKeyCode(126, ['f15']);
bindKeyCode(127, ['f16']);
bindKeyCode(128, ['f17']);
bindKeyCode(129, ['f18']);
bindKeyCode(130, ['f19']);
bindKeyCode(131, ['f20']);
bindKeyCode(132, ['f21']);
bindKeyCode(133, ['f22']);
bindKeyCode(134, ['f23']);
bindKeyCode(135, ['f24']);
//a-z and A-Z
for (let keyCode = 65; keyCode <= 90; keyCode += 1) {
    const keyName = String.fromCharCode(keyCode + 32).toLowerCase();
    bindKeyCode(keyCode, [keyName]);
}
const semicolonKeyCode = isFirefox ? 59 : 186;
const dashKeyCode = isFirefox ? 173 : 189;
const equalKeyCode = isFirefox ? 61 : 187;
bindKeyCode(semicolonKeyCode, ['semicolon', 'semi', ';', ':']);
bindKeyCode(dashKeyCode, ['dash', '-', '_']);
bindKeyCode(equalKeyCode, ['equal', 'equalsign', '=']);
/**
 * 根据键值或者键名
 * @param {number} keycode
 * @returns {string[]}
 */
function getKeyNamesByCode(keycode) {
    return keyCodeNamesMap[keycode] || [];
}
/**
 * 根据键名获取键值
 * @param {string} keyName
 * @returns {number}
 */
function getKeyCodeByName(keyName) {
    return keyNameCodeMap[keyName.toLowerCase()] || 0;
}
const modifiedKeyNameAliasMap = o();
const bindKeyNameAlias = (stdName, aliases) => {
    modifiedKeyNameAliasMap[stdName] = stdName;
    aliases.forEach((alias) => (modifiedKeyNameAliasMap[alias] = stdName));
};
const ALT_KEY_NAME = 'alt';
const CTRL_KEY_NAME = 'ctrl';
const META_KEY_NAME = 'meta';
const SHIFT_KEY_NAME = 'shift';
bindKeyNameAlias(ALT_KEY_NAME, ['menu', 'option', '⌥']);
bindKeyNameAlias(CTRL_KEY_NAME, ['control', '⌃']);
bindKeyNameAlias(META_KEY_NAME, ['command', 'cmd', 'windows', 'win', 'super', '⌘', '', '⊞']);
bindKeyNameAlias(SHIFT_KEY_NAME, ['⇪']);
const defaults = {
    el: document,
    timeout: 500
};
const _options = Symbol();
const _init = Symbol();
const _onKeyDown = Symbol();
const _bindingList = Symbol();
const _keyPathHandlerObj = Symbol();
const _callKeyPath = Symbol();
const _shortcutsToKeyInfoList = Symbol();
const _keyInfoListToKeyPath = Symbol();
const _unbindOne = Symbol();
const _unbindBatch = Symbol();
const _unbindAll = Symbol();
const _comboKeyPathList = Symbol();
const _comboKeyPath = Symbol();
const _comboTimer = Symbol();
class Keyboard {
    constructor(options) {
        this[_options] = objectMerge(o(), defaults, options);
        this[_bindingList] = [];
        this[_keyPathHandlerObj] = o();
        this[_comboKeyPathList] = [];
        this[_comboTimer] = 0;
        this[_init]();
    }
    /**
     * 绑定快捷键
     * @param {KeyboardShortcuts} shortcuts
     * @param {KeyboardHandler<T>} handler
     * @returns {Keyboard<T>}
     */
    bind(shortcuts, handler) {
        const keyInfoList = this[_shortcutsToKeyInfoList](shortcuts);
        const keyPath = this[_keyInfoListToKeyPath](keyInfoList);
        const { [keyPath]: handlerList = [] } = this[_keyPathHandlerObj];
        handlerList.push(handler);
        this[_keyPathHandlerObj][keyPath] = handlerList;
        return this;
    }
    /**
     * 解除快捷键绑定
     * @param {KeyboardShortcuts} shortcuts
     * @param {KeyboardHandler<T>} handler
     * @returns {Keyboard<T>}
     */
    unbind(shortcuts, handler) {
        if (shortcuts && handler) {
            this[_unbindOne](shortcuts, handler);
        }
        else if (shortcuts) {
            this[_unbindBatch](shortcuts);
        }
        else {
            this[_unbindAll]();
        }
        return this;
    }
    /**
     * 销毁
     * 1. 解除 DOM 上的事件绑定
     * 2. 解除所有快捷键对应关系
     * 3. 清除计时器
     */
    destroy() {
        // 1.
        this[_bindingList].forEach(([el, type, listener]) => {
            el.removeEventListener(type, listener);
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this[_bindingList] = null;
        // 2.
        this.unbind();
        // 3.
        clearTimeout(this[_comboTimer]);
    }
    [_unbindOne](shortcuts, handler) {
        const keyInfoList = this[_shortcutsToKeyInfoList](shortcuts);
        const keyPath = this[_keyInfoListToKeyPath](keyInfoList);
        const { [keyPath]: handlers } = this[_keyPathHandlerObj];
        if (!handlers)
            return;
        arrayRemove(handlers, (el) => el === handler);
    }
    [_unbindBatch](shortcuts) {
        const keyInfoList = this[_shortcutsToKeyInfoList](shortcuts);
        const keyPath = this[_keyInfoListToKeyPath](keyInfoList);
        const { [keyPath]: handlers } = this[_keyPathHandlerObj];
        if (!handlers)
            return;
        this[_keyPathHandlerObj][keyPath] = [];
    }
    [_unbindAll]() {
        this[_keyPathHandlerObj] = o();
    }
    [_init]() {
        const { el } = this[_options];
        const onKeyDown = this[_onKeyDown].bind(this);
        this[_bindingList].push([el, 'keydown', onKeyDown]);
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        el.addEventListener('keydown', onKeyDown);
    }
    /**
     * 将快捷键转换为键位对象
     * @param {KeyboardShortcuts} shortcuts
     * @returns {KeyInfo}
     */
    [_shortcutsToKeyInfoList](shortcuts) {
        const shortcutsList = isString(shortcuts) ? [shortcuts] : shortcuts;
        return shortcutsList.map((shortcuts) => {
            const keyInfo = o();
            shortcuts
                .toLowerCase()
                .replace(/\s/g, '')
                .split(KEY_BIND_STR)
                .forEach((keyName) => {
                const modifiedKeyName = modifiedKeyNameAliasMap[keyName];
                if (modifiedKeyName)
                    keyInfo[modifiedKeyName] = true;
                else
                    keyInfo.code = getKeyCodeByName(keyName);
            });
            return keyInfo;
        });
    }
    /**
     * 将键位对象转换为键路径
     * @param {KeyInfo} keyInfoList
     * @returns {string[]}
     */
    [_keyInfoListToKeyPath](keyInfoList) {
        return keyInfoList
            .map((keyInfo) => {
            const keyPath = [];
            if (keyInfo.alt)
                keyPath.push(ALT_KEY_NAME);
            if (keyInfo.ctrl)
                keyPath.push(CTRL_KEY_NAME);
            if (keyInfo.meta)
                keyPath.push(META_KEY_NAME);
            if (keyInfo.shift)
                keyPath.push(SHIFT_KEY_NAME);
            if (keyInfo.code)
                keyPath.push(keyInfo.code.toString());
            return keyPath.join(KEY_BIND_STR);
        })
            .join(KEY_COMBO_STR);
    }
    [_onKeyDown](ev) {
        const { keyCode } = ev;
        if (keyCodeNamesMap[keyCode]) {
            const keyInfo = { code: keyCode };
            if (ev.altKey)
                keyInfo.alt = true;
            if (ev.ctrlKey)
                keyInfo.ctrl = true;
            if (ev.metaKey)
                keyInfo.meta = true;
            if (ev.shiftKey)
                keyInfo.shift = true;
            const keyPath = this[_keyInfoListToKeyPath]([keyInfo]);
            this[_callKeyPath](keyPath, ev);
            this[_comboKeyPath](keyPath, ev);
        }
    }
    /**
     * 组合键判断
     * @param {string} keyPath
     * @param {KeyboardEvent} ev
     */
    [_comboKeyPath](keyPath, ev) {
        const { timeout } = this[_options];
        clearTimeout(this[_comboTimer]);
        this[_comboKeyPathList].push(keyPath);
        this[_comboTimer] = window.setTimeout(() => {
            this[_comboKeyPathList].length = 0;
        }, timeout);
        if (this[_comboKeyPathList].length < 2)
            return;
        const comboKeyPath = this[_comboKeyPathList].join(KEY_COMBO_STR);
        this[_callKeyPath](comboKeyPath, ev);
    }
    [_callKeyPath](keyPath, ev) {
        const { el } = this[_options];
        const handlerList = this[_keyPathHandlerObj][keyPath];
        if (handlerList)
            handlerList.forEach((handler) => handler.call(el, ev));
    }
}

export { Keyboard as default, defaults, getKeyCodeByName, getKeyNamesByCode, isChrome, isFirefox, isMac, isOpera, isSafari };
