'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var array = require('jsc-utils/array');
var object = require('jsc-utils/object');
var type = require('jsc-utils/type');
var validator = require('jsc-utils/validator');
var string = require('jsc-utils/string');
var fault = require('./fault.js');

const MEMBER_MESSAGES = {
    type: '',
    format: '',
    required: '${field}不能为空',
    min: '${field}不能小于 ${limits[0]}',
    max: '${field}不能大于 ${limits[0]}',
    range: '${field}必须在 ${limits[0]}-${limits[1]} 之间',
    minLength: '${field}不能少于 ${limits[0]} 个长度',
    maxLength: '${field}不能超过 ${limits[0]} 个长度',
    length: '${field}必须是 ${limits[0]} 个长度',
    flex: '${field}必须是 ${limits[0]}-${limits[1]} 个长度之间',
    enum: '${field}必须是${limits[0].join("、")}之一',
    pattern: '${field}不合法',
    same: '',
    equal: '${field}不正确',
    match: '',
    add: ''
};
const TYPE_NAME_MAP = {
    string: '字符串',
    number: '数值',
    boolean: '布尔值',
    object: '对象',
    array: '数组',
    date: '日期',
    method: '方法',
    regExp: '正则'
};
const TYPE_VALIDATORS = {
    string: type.isString,
    number: type.isNumber,
    boolean: type.isBoolean,
    object: type.isObject,
    array: type.isArray,
    date: type.isDate,
    method: type.isFunction,
    regExp: type.isRegExp
};
const FORMAT_NAME_MAP = {
    url: ' URL 地址',
    email: '邮箱',
    phone: '手机号码',
    ipv4: ' IP 地址',
    idNo: '身份证号码',
    integer: '整数',
    float: '浮点数',
    numerical: '数值',
    digit: '数字'
};
const FORMAT_VALIDATORS = {
    url: validator.isUrl,
    email: validator.isEmail,
    phone: validator.isPhone,
    ipv4: validator.isIpV4,
    idNo: validator.isIdNo,
    integer: validator.isInteger,
    float: validator.isFloat,
    numerical: validator.isNumerical,
    digit: validator.isDigit
};
const VALIDATION_FLAG = Symbol('__isValidation__');
const defaults = {
    first: true,
    trigger: undefined,
    fields: undefined
};
const isEmpty = (value) => {
    if (type.isUndefined(value) || type.isNull(value) || value === '')
        return true;
    if (array.arrayLike(value))
        return value.length === 0;
    if (type.isObject(value))
        return Object.keys(value).length === 0;
    return false;
};
const messageGetter = (messageFunc, message) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (type.isFunction(message))
        return message;
    if (type.isString(message))
        return (value, source, rule, schema, msgData) => string.stringAssign(message, msgData);
    if (type.isString(messageFunc))
        return (value, source, rule, schema, msgData) => string.stringAssign(messageFunc, msgData);
    return messageFunc;
};
const limitsGetter1 = (limit1) => {
    if (type.isFunction(limit1))
        return (value, source, rule, schema) => 
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        [limit1(value, source, rule, schema)];
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return () => [limit1];
};
const limitsGetter2 = (limit1, limit2) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return (value, source, rule, schema) => {
        const realLimit1 = type.isFunction(limit1) ? limit1(value, source, rule, schema) : limit1;
        const realLimit2 = type.isFunction(limit2) ? limit2(value, source, rule, schema) : limit2;
        return [realLimit1, realLimit2];
    };
};
const matcherToValidator = (matcher) => {
    return async (value, source, rule, schema, limits) => {
        const result = await matcher(value, source, rule, schema, limits);
        // 返回字符串
        if (type.isString(result)) {
            throw new Error(result);
        }
        // 返回一个错误对象
        if (type.isError(result)) {
            throw result;
        }
        // 返回一个布尔值
        if (type.isBoolean(result)) {
            return result;
        }
        return true;
    };
};
const matchSymbol = (obj) => {
    if (!type.isObject(obj))
        return false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (obj[VALIDATION_FLAG] === VALIDATION_FLAG)
        return true;
    return Object.getOwnPropertySymbols(obj).some((symbol) => String(symbol) === String(VALIDATION_FLAG));
};
const isValidationRules = (rules) => {
    if (type.isObject(rules))
        return false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (rules.length === 0)
        return false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return matchSymbol(rules[0]);
};
const isValidationSchema = (schema) => {
    return matchSymbol(schema);
};
const isValidationInstance = (v) => {
    return matchSymbol(v);
};
class Validation {
    constructor() {
        this[VALIDATION_FLAG] = VALIDATION_FLAG;
        this._schema = {
            [VALIDATION_FLAG]: VALIDATION_FLAG
        };
        this._fieldList = [];
        this._standaloneField = '';
    }
    static create() {
        return new Validation();
    }
    /**
     * 导出所有字段的表单验证模式
     * @returns {ValidationSchema}
     */
    exportSchema() {
        return this._schema;
    }
    /**
     * 导入所有字段的验证模式
     * @param {ValidationSchema} schema
     * @returns {Validation}
     */
    importSchema(schema) {
        this._schema = schema;
        this._fieldList = Object.keys(schema);
        return this;
    }
    /**
     * 导出指定字段的验证描述
     * @param {string} field
     * @returns {ValidationDesc}
     */
    exportDesc(field) {
        const { _schema } = this;
        let found = { [VALIDATION_FLAG]: VALIDATION_FLAG, field, rules: [], usable: () => true };
        object.objectEach(_schema, (desc, _field) => {
            if (_field === field) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                found = desc;
                return false;
            }
        });
        return found;
    }
    /**
     * 获取指定字段的验证规则
     * @returns {ValidationRules}
     */
    get rules() {
        const { _standaloneField } = this;
        if (_standaloneField === '')
            throw new Error('非独立模式不能获取验证规则');
        return this.exportDesc(_standaloneField).rules;
    }
    /**
     * 独立模式，只能导出配置的验证规则
     * @returns {Validation}
     */
    standalone() {
        const field = 's';
        this._standaloneField = field;
        this.field(field);
        return this;
    }
    /**
     * 设置验证字段
     * @param {string} field
     * @returns {Validation}
     */
    field(field) {
        // console.log(field, 'filed');
        this._currentField = field;
        // console.log(this._fieldList, '2')
        const found = this._fieldList.some((match) => match === field);
        if (found) {
            this._currentDesc = this._schema[field];
            const { _currentDesc } = this;
            this._currentRuleList = _currentDesc.rules;
            this._currentLabel = _currentDesc.label;
            return this;
        }
        this._currentLabel = undefined;
        this._currentRuleList = [];
        this._currentDesc = {
            [VALIDATION_FLAG]: VALIDATION_FLAG,
            field,
            rules: this._currentRuleList,
            usable: () => true
        };
        this._schema[field] = this._currentDesc;
        this._fieldList.push(field);
        // console.log(this._fieldList, '1')
        return this;
    }
    /**
     * 设置字段名称
     * @param {string} label
     * @returns {Validation}
     */
    label(label) {
        const { _currentDesc } = this;
        if (!_currentDesc)
            throw new Error('必须先指定验证字段');
        this._currentLabel = label;
        _currentDesc.label = label;
        return this;
    }
    /**
     * 寻找验证规则中是否有某个规则
     * @param {ValidationMemberName} type
     * @returns {boolean}
     */
    has(type) {
        const { _currentRuleList } = this;
        console.log(type, 'type');
        if (!_currentRuleList)
            throw new Error('必须先指定验证字段');
        return _currentRuleList.some((rule) => rule.type === type);
    }
    /**
     * 必填验证
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    required(message) {
        this._createRule('required', {
            validator: (value) => !isEmpty(value),
            limits: limitsGetter1(true),
            message: messageGetter(MEMBER_MESSAGES.required, message)
        });
        this._pushRule();
        console.log(this, 'this');
        return this;
    }
    /**
     * 数据类型验证
     * @param {ValidationLimit<ValidationTypeName>} type
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    type(type$1, message) {
        this._createRule('type', {
            validator: (value, source, rule, schema, msgData) => {
                if (type.isUndefined(value) || type.isNull(value))
                    return true;
                const [type$1] = msgData.limits;
                return TYPE_VALIDATORS[type$1](value);
            },
            limits: limitsGetter1(type$1),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const type = TYPE_NAME_MAP[msgData.limits[0]];
                return string.stringAssign('${field}必须是' + type + '类型', msgData);
            }, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 数据格式验证
     * @param {ValidationLimit<ValidationFormatName>} format
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    format(format, message) {
        this._createRule('format', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [format] = msgData.limits;
                return FORMAT_VALIDATORS[format](value);
            },
            limits: limitsGetter1(format),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const type = FORMAT_NAME_MAP[msgData.limits[0]];
                return string.stringAssign('${field}必须是' + type + '格式', msgData);
            }, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 最小值
     * @param {ValidationLimit<number>} min
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    min(min, message) {
        this._createRule('min', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [min] = msgData.limits;
                return Number(value) >= min;
            },
            limits: limitsGetter1(min),
            message: messageGetter(MEMBER_MESSAGES.min, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 最大值
     * @param {ValidationLimit<number>} max
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    max(max, message) {
        this._createRule('max', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [max] = msgData.limits;
                return Number(value) <= max;
            },
            limits: limitsGetter1(max),
            message: messageGetter(MEMBER_MESSAGES.max, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 指定数值范围
     * @param {ValidationLimit<number>} min
     * @param {ValidationLimit<number>} max
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    range(min, max, message) {
        this._createRule('range', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [min, max] = msgData.limits;
                return value >= min && value <= max;
            },
            limits: limitsGetter2(min, max),
            message: messageGetter(MEMBER_MESSAGES.range, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 最小长度
     * @param {ValidationLimit<number>} minLength
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    minLength(minLength, message) {
        this._createRule('minLength', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [minLength] = msgData.limits;
                return value.length >= minLength;
            },
            limits: limitsGetter1(minLength),
            message: messageGetter(MEMBER_MESSAGES.minLength, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 最大长度
     * @param {ValidationLimit<number>} maxLength
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    maxLength(maxLength, message) {
        this._createRule('maxLength', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [maxLength] = msgData.limits;
                return value.length <= maxLength;
            },
            limits: limitsGetter1(maxLength),
            message: messageGetter(MEMBER_MESSAGES.maxLength, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 弹性长度
     * @param {ValidationLimit<number>} minLength
     * @param {ValidationLimit<number>} maxLength
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    flex(minLength, maxLength, message) {
        this._createRule('flex', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const { length } = value;
                const [minLength, maxLength] = msgData.limits;
                return length >= minLength && length <= maxLength;
            },
            limits: limitsGetter2(minLength, maxLength),
            message: messageGetter(MEMBER_MESSAGES.flex, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 指定长度
     * @param {ValidationLimit<number>} length
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    length(length, message) {
        this._createRule('length', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [length] = msgData.limits;
                return value.length === length;
            },
            limits: limitsGetter1(length),
            message: messageGetter(MEMBER_MESSAGES.length, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 枚举匹配
     * @param {ValidationLimit<AnyArray>} enums
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    enum(enums, message) {
        this._createRule('length', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [enums] = msgData.limits;
                return enums.some((match) => match === value);
            },
            limits: limitsGetter1(enums),
            message: messageGetter(MEMBER_MESSAGES.enum, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 正则匹配
     * @param {ValidationLimit<RegExp | string>} pattern
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    pattern(pattern, message) {
        this._createRule('pattern', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [pattern] = msgData.limits;
                if (type.isRegExp(pattern))
                    return pattern.test(value);
                return value.indexOf(pattern) > -1;
            },
            limits: limitsGetter1(pattern),
            message: messageGetter(MEMBER_MESSAGES.pattern, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 与……相同
     * @param {ValidationLimit<string>} field
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    same(field, message) {
        this._createRule('same', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [field] = msgData.limits;
                return value === source[field];
            },
            limits: limitsGetter1(field),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const field = msgData.limits[0];
                const desc = schema[field];
                const target = desc ? desc.label || desc.field : field;
                return string.stringAssign('${field}必须与' + target + '相同', msgData);
            }, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 与……相等
     * @param {ValidationLimit<any>} match
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    equal(match, message) {
        this._createRule('equal', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value))
                    return true;
                const [match] = msgData.limits;
                return value === match;
            },
            limits: limitsGetter1(match),
            message: messageGetter(MEMBER_MESSAGES.equal, message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 自定义验证规则函数
     * @param {ValidationMatcher} matcher
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    match(matcher, message) {
        const validator = matcherToValidator(matcher);
        this._createRule('match', {
            validator,
            message: messageGetter('${field}不符合规则', message)
        });
        this._pushRule();
        return this;
    }
    /**
     * 添加某些已经定义好的验证规则
     * @param {Validation} rules
     * @returns {Validation}
     */
    add(rules) {
        rules.rules.forEach((rule) => {
            this._currentRule = rule; // objectAssign({}, rule) as ValidationRule;
            this._pushRule();
        });
        return this;
    }
    /**
     * 验证规则是否可用
     * @param {ValidationEnable} enable
     * @returns {Validation}
     */
    enable(enable) {
        const { _currentRule } = this;
        if (!_currentRule)
            throw new Error('必须先指定验证规则');
        _currentRule.enable = type.isFunction(enable) ? enable : () => enable;
        return this;
    }
    /**
     * 指定触发条件
     * @param {string} triggers
     * @returns {Validation}
     */
    trigger(...triggers) {
        const { _currentRule } = this;
        if (!_currentRule)
            throw new Error('必须先指定验证规则');
        _currentRule.triggers = triggers;
        return this;
    }
    /**
     * 验证字段是否生效
     * @param {ValidationUsable} usable
     * @returns {Validation}
     */
    usable(usable) {
        const { _currentDesc } = this;
        if (!_currentDesc)
            throw new Error('必须先指定验证字段');
        _currentDesc.usable = type.isFunction(usable) ? usable : () => usable;
        return this;
    }
    /**
     * 表单验证
     * @param {AnyObject} source 原始数据
     * @param {Partial<ValidationOptions> | ValidationCallback} [options] 配置
     * @param {ValidationCallback} [callback] 回调
     * @returns {Promise<boolean> | void}
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    validate(source, options, callback) {
        const faultify = (faults) => new fault({ message: faults[0].message, faults });
        const callbackMode = (options, callback) => {
            this._validate(source, options).then((faults) => {
                if (faults.length === 0) {
                    callback(null, true);
                    return;
                }
                callback(faultify(faults), false);
            });
        };
        const promiseMode = (options) => {
            return new Promise((resolve, reject) => {
                this._validate(source, options).then((faults) => {
                    if (faults.length === 0)
                        return resolve(true);
                    reject(faultify(faults));
                });
            });
        };
        // validate(source, options, callback);
        if (type.isObject(options) && type.isFunction(callback)) {
            return callbackMode(options, callback);
        }
        // validate(source, options);
        if (type.isObject(options)) {
            return promiseMode(options);
        }
        // validate(source, callback);
        if (type.isFunction(options)) {
            return callbackMode({}, options);
        }
        return promiseMode({});
    }
    destroy() {
        this._fieldList = null;
        this._schema = null;
        this._currentDesc = null;
        this._currentField = null;
        this._currentLabel = null;
    }
    _createRule(type, assigned) {
        if (!this._currentField)
            throw new Error('必须先指定验证字段');
        const rule = object.objectAssign({
            [VALIDATION_FLAG]: VALIDATION_FLAG,
            type,
            triggers: [],
            limits: () => [],
            enable: () => true
        }, assigned);
        this._currentRule = rule;
        return rule;
    }
    _pushRule() {
        this._currentRuleList.push(this._currentRule);
    }
    async _validate(source, options) {
        const faults = [];
        const opts = object.objectAssign({}, defaults, options);
        const { first, fields, trigger } = opts;
        const { _schema: schema } = this;
        const exitable = () => (first === true ? faults.length === 1 : false);
        const fieldTest = (field) => {
            if (!type.isArray(fields))
                return true;
            return fields.some((item) => item === field);
        };
        const usableTest = (field) => {
            const value = source[field];
            const { usable } = schema[field];
            return usable(value, source, schema);
        };
        const enableTest = (value, rule, msgData) => {
            const { enable, limits } = rule;
            return enable(value, source, rule, schema, msgData);
        };
        const triggerTest = (trigger, rule, msgData) => {
            if (!type.isString(trigger))
                return true;
            if (trigger.length === 0)
                return true;
            const { triggers } = rule;
            if (triggers.length === 0)
                return true;
            return triggers.some((item) => item === trigger);
        };
        const validate = async (field, value, rule, desc, msgData) => {
            const { validator, message, type: type$1 } = rule;
            const { label } = desc;
            const pushFault = (message) => {
                let realMessage;
                if (type.isString(message))
                    realMessage = string.stringAssign(message, msgData);
                else
                    realMessage = message(value, source, rule, schema, msgData);
                faults.push(new fault({
                    message: realMessage,
                    field,
                    label,
                    type: type$1
                }));
            };
            if (!type.isFunction(validator))
                return;
            try {
                const invalid = await validator(value, source, rule, schema, msgData);
                if (invalid === false) {
                    pushFault(message);
                }
            }
            catch (err) {
                if (type.isString(err))
                    pushFault(err);
                else
                    pushFault(err.message);
            }
        };
        for (const field of this._fieldList) {
            if (fieldTest(field) === false)
                continue;
            if (usableTest(field) === false)
                continue;
            const desc = schema[field];
            const value = source[field];
            const { rules, label } = desc;
            for (const rule of rules) {
                const { type, limits } = rule;
                const realLimits = limits(value, source, rule, schema);
                const msgData = {
                    type,
                    field: label || field,
                    limits: realLimits
                };
                if (enableTest(value, rule, msgData) === false)
                    continue;
                if (triggerTest(trigger, rule) === false)
                    continue;
                await validate(field, value, rule, desc, msgData);
                if (exitable())
                    break;
            }
            if (exitable())
                break;
        }
        return faults;
    }
}
/**
 * 导入表单验证模式，兼容 async-validator
 * @param {AsyncValidatorRules | ValidationSchema<AnyArray>} schema
 * @returns {Validation}
 */
const importSchema = (schema) => {
    const v = new Validation();
    if (isValidationSchema(schema)) {
        v.importSchema(schema);
        return v;
    }
    const ASYNC_VALIDATION_TYPE_TO_TYPE = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        method: 'method',
        regexp: 'regExp',
        array: 'array',
        object: 'object',
        date: 'date',
        url: 'string',
        hex: 'string',
        email: 'string'
    };
    const ASYNC_VALIDATION_TYPE_TO_FORMAT = {
        integer: 'integer',
        float: 'float',
        url: 'url',
        email: 'email'
    };
    const getType = (rule, rules) => {
        const foundTypeRule = rules.find((rule) => rule.type !== undefined);
        return rule.type || (foundTypeRule && foundTypeRule.type) || null;
    };
    const adaptRequiredRule = (rule, rules) => {
        getType(rule, rules);
        const { required, message, trigger } = rule;
        if (!required)
            return;
        v.required(message);
        if (trigger)
            v.trigger(trigger);
    };
    const adaptTypeRule = (rule, rules) => {
        const { type } = rule;
        if (!type)
            return;
        const { message, trigger } = rule;
        const thisType = ASYNC_VALIDATION_TYPE_TO_TYPE[type];
        if (!thisType)
            return;
        v.type(thisType, message);
        if (trigger)
            v.trigger(trigger);
    };
    const adaptFormatRule = (rule, rules) => {
        const type = getType(rule, rules);
        const { message, trigger } = rule;
        if (!type)
            return;
        const thisFormat = ASYNC_VALIDATION_TYPE_TO_FORMAT[type];
        if (!thisFormat)
            return;
        v.format(thisFormat, message);
        if (trigger)
            v.trigger(trigger);
    };
    const adaptEnumRule = (rule, rules) => {
        const type = getType(rule, rules);
        const { enum: enums, message, trigger } = rule;
        if (type !== 'enum' || !enums)
            return;
        v.enum(enums, message);
        if (trigger)
            v.trigger(trigger);
    };
    const adaptMinRule = (rule, rules) => {
        const type$1 = getType(rule, rules);
        const { min, message, trigger } = rule;
        if (!type.isNumber(min))
            return;
        switch (type$1) {
            case 'string':
            case 'array':
                v.minLength(min, message);
                break;
            case 'number':
                v.min(min, message);
                break;
        }
        if (trigger)
            v.trigger(trigger);
    };
    const adaptMaxRule = (rule, rules) => {
        const type$1 = getType(rule, rules);
        const { max, message, trigger } = rule;
        if (!type.isNumber(max))
            return;
        switch (type$1) {
            case 'string':
            case 'array':
                v.maxLength(max, message);
                break;
            case 'number':
                v.max(max, message);
                break;
        }
        if (trigger)
            v.trigger(trigger);
    };
    const adaptLenRule = (rule, rules) => {
        const type$1 = getType(rule, rules);
        const { len, message, trigger } = rule;
        if (!type.isNumber(len))
            return;
        switch (type$1) {
            case 'string':
            case 'array':
                v.length(len, message);
                break;
            case 'number':
                v.equal(len, message);
                break;
        }
        if (trigger)
            v.trigger(trigger);
    };
    const adaptPattern = (rule, rules) => {
        const type = getType(rule, rules);
        const { pattern, message, trigger } = rule;
        if (type !== 'string' || !pattern)
            return;
        v.pattern(pattern, message);
        if (trigger)
            v.trigger(trigger);
    };
    const adaptValidatorRule = (rule, rules) => {
        getType(rule, rules);
        const { validator, trigger } = rule;
        if (!type.isFunction(validator))
            return;
        v.match((value, source, rule1, schema1) => {
            return new Promise((resolve, reject) => {
                validator(rule, value, (err) => {
                    if (err)
                        return reject(err);
                    resolve(true);
                }, source, {});
            });
        });
        if (trigger)
            v.trigger(trigger);
    };
    object.objectEach(schema, (asyncValidatorRules, field) => {
        v.field(field);
        // 当其中一个规则是一个 Validation 实例时，直接导入
        if (isValidationInstance(asyncValidatorRules)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            v._currentRuleList.push(...asyncValidatorRules.rules);
            return;
        }
        const _rules = type.isArray(asyncValidatorRules) ? asyncValidatorRules : [asyncValidatorRules];
        _rules.forEach((rule) => {
            const { 
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            [VALIDATION_FLAG]: flag, whitespace, fields, options, defaultField, transform, asyncValidator } = rule;
            if (flag === VALIDATION_FLAG) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                v._currentRuleList.push(rule);
                return;
            }
            if (whitespace || fields || options || defaultField || transform || asyncValidator)
                throw new Error('暂不支持 whitespace、fields、options、defaultField、transform、asyncValidator 规则导入');
            adaptRequiredRule(rule, _rules);
            adaptTypeRule(rule);
            adaptFormatRule(rule, _rules);
            adaptEnumRule(rule, _rules);
            adaptMinRule(rule, _rules);
            adaptMaxRule(rule, _rules);
            adaptLenRule(rule, _rules);
            adaptPattern(rule, _rules);
            adaptValidatorRule(rule, _rules);
        });
    });
    return v;
};
/**
 * 导入表单验证规则，兼容 async-validator
 * @param {string} field
 * @param {AsyncValidatorRuleItem | AsyncValidatorRuleItem[] | ValidationRules} rules
 * @returns {Validation}
 */
const importRules = (field, rules) => {
    // 直接导入的是 validation 实例
    if (isValidationInstance(rules)) {
        return importRules(field, rules.rules);
    }
    if (isValidationRules(rules)) {
        const schema = {
            [field]: {
                field,
                rules: rules,
                usable: () => true,
                [VALIDATION_FLAG]: VALIDATION_FLAG
            },
            [VALIDATION_FLAG]: VALIDATION_FLAG
        };
        return importSchema(schema);
    }
    const rules2 = type.isObject(rules) ? [rules] : rules;
    const schema = { [field]: rules2 };
    return importSchema(schema);
};
const create = (member, args) => {
    const v = new Validation().standalone();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return v[member].call(v, ...args);
};
const members = [
    'required',
    'type',
    'format',
    'min',
    'max',
    'range',
    'minLength',
    'maxLength',
    'length',
    'flex',
    'enum',
    'pattern',
    'same',
    'equal',
    'match',
    'add'
];
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const va = {};
members.forEach((member) => {
    console.log(member, 'member');
    va[member] = (...args) => {
        return create(member, args);
    };
});
console.log(va.required, 'va');

exports.MEMBER_MESSAGES = MEMBER_MESSAGES;
exports["default"] = Validation;
exports.defaults = defaults;
exports.importRules = importRules;
exports.importSchema = importSchema;
exports.va = va;
