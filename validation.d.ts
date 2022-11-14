import { arrayLike } from 'jsc-utils/array';
import { objectAssign, objectEach } from 'jsc-utils/object';
import {
    AnyArray,
    AnyObject,
    isArray,
    isBoolean,
    isDate,
    isError,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isRegExp,
    isString,
    isUndefined
} from 'jsc-utils/type';
import {
    isDigit,
    isEmail,
    isFloat,
    isIdNo,
    isInteger,
    isIpV4,
    isNumerical,
    isPhone,
    isUrl
} from 'jsc-utils/validator';
import { stringAssign } from 'jsc-utils/string';
export type AsyncValidatorRuleType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'method'
    | 'regexp'
    | 'integer'
    | 'float'
    | 'array'
    | 'object'
    | 'enum'
    | 'date'
    | 'url'
    | 'hex'
    | 'email'
    | 'any';
export interface AsyncValidatorRuleItem {
    trigger?: string;
    type?: AsyncValidatorRuleType; // default type is 'string'
    required?: boolean;
    pattern?: RegExp | string;
    min?: number; // Range of type 'string' and 'array'
    max?: number; // Range of type 'string' and 'array'
    len?: number; // Length of type 'string' and 'array'
    enum?: Array<string | number | boolean | null | undefined>; // possible values of type 'enum'
    whitespace?: boolean;
    fields?: AsyncValidatorRules; // ignore when without required
    options?: AnyObject;
    defaultField?: { type: AsyncValidatorRuleType }; // 'object' or 'array' containing validation rules
    transform?: (value: any) => any;
    message?: string;
    asyncValidator?: (
        rule: AsyncValidatorRuleItem,
        value: any,
        callback: (error: string | string[] | void) => void,
        source: AnyObject,
        options: AnyObject
    ) => void | Promise<void>;
    validator?: (
        rule: AsyncValidatorRuleItem,
        value: any,
        callback: (error: string | string[] | void) => void,
        source: AnyObject,
        options: AnyObject
    ) => void;
}
export interface AsyncValidatorRules {
    [field: string]: AsyncValidatorRuleItem | AsyncValidatorRuleItem[];
}
import Fault from './fault';

type AsyncValidatorTypeMapping = {
    [type in AsyncValidatorRuleType]: string;
};

export type ValidationMemberName =
    | 'required'
    | 'type'
    | 'format'
    | 'min'
    | 'max'
    | 'range'
    | 'minLength'
    | 'maxLength'
    | 'length'
    | 'flex'
    | 'enum'
    | 'pattern'
    | 'same'
    | 'equal'
    | 'match'
    | 'add';
export const MEMBER_MESSAGES: Record<ValidationMemberName, string> = {
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

export type ValidationTypeName = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'method' | 'regExp';
const TYPE_NAME_MAP: Record<ValidationTypeName, string> = {
    string: '字符串',
    number: '数值',
    boolean: '布尔值',
    object: '对象',
    array: '数组',
    date: '日期',
    method: '方法',
    regExp: '正则'
};
export type ValidationTypeValidator = (value: any) => boolean;
const TYPE_VALIDATORS: Record<ValidationTypeName, ValidationTypeValidator> = {
    string: isString,
    number: isNumber,
    boolean: isBoolean,
    object: isObject,
    array: isArray,
    date: isDate,
    method: isFunction,
    regExp: isRegExp
};

export type ValidationFormatName =
    | 'url'
    | 'email'
    | 'phone'
    | 'ipv4'
    | 'idNo'
    | 'integer'
    | 'float'
    | 'numerical'
    | 'digit';
const FORMAT_NAME_MAP: Record<ValidationFormatName, string> = {
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
export type ValidationFormatValidator = (value: string) => boolean;
const FORMAT_VALIDATORS: Record<ValidationFormatName, ValidationFormatValidator> = {
    url: isUrl,
    email: isEmail,
    phone: isPhone,
    ipv4: isIpV4,
    idNo: isIdNo,
    integer: isInteger,
    float: isFloat,
    numerical: isNumerical,
    digit: isDigit
};

interface ValidationMsgData extends AnyObject {
    type: ValidationMemberName;
    field: string;
    limits: AnyArray;
}
type ValidationStaticFunc<Return> = (
    value: any,
    source: AnyObject,
    rule: ValidationRule,
    schema: ValidationSchema,
    msgData: ValidationMsgData
) => Return;
type ValidationDynamicFunc<Return> = Return | ValidationStaticFunc<Return>;

// match
type ValidationAsyncValidator = ValidationStaticFunc<boolean | Promise<boolean>>;
type ValidationMatchReturn = string | boolean | void | Error;
type ValidationMatcher =
    | ValidationStaticFunc<ValidationMatchReturn>
    | ValidationStaticFunc<Promise<ValidationMatchReturn>>;

// limit
type ValidationLimitFunc<Limit> = (
    value: any,
    source: AnyObject,
    rule: ValidationRule,
    schema: ValidationSchema
) => Limit;
export type ValidationLimit<Limit> = Limit | ValidationLimitFunc<Limit>;
type ValidationLimitsFunc<Limits extends AnyArray> = (
    value: any,
    source: AnyObject,
    rule: ValidationRule,
    schema: ValidationSchema
) => Limits;

// message
type ValidationMessageFunc = ValidationStaticFunc<string>;
export type ValidationMessage = ValidationDynamicFunc<string>;

// enable
type ValidationEnableFunc = ValidationStaticFunc<boolean>;
export type ValidationEnable = ValidationDynamicFunc<boolean>;

// usable
type ValidationUsableFunc = (value: any, source: AnyObject, schema: ValidationSchema) => boolean;
export type ValidationUsable = boolean | ValidationUsableFunc;

const VALIDATION_FLAG = Symbol('__isValidation__');
export interface ValidationRule {
    [VALIDATION_FLAG]: typeof VALIDATION_FLAG;
    type: ValidationMemberName;
    limits: ValidationLimitsFunc<AnyArray>;
    triggers: string[];
    message: ValidationMessageFunc;
    enable: ValidationEnableFunc;
    validator: ValidationAsyncValidator;
}
export type ValidationRules = ValidationRule[];
export interface ValidationDesc {
    field: string;
    label?: string;
    usable: ValidationUsableFunc;
    rules: ValidationRules;
    [VALIDATION_FLAG]: typeof VALIDATION_FLAG;
}
export interface ValidationSchema {
    [field: string]: ValidationDesc;
    [VALIDATION_FLAG]: typeof VALIDATION_FLAG;
}

export interface ValidationOptions {
    first: boolean;
    trigger: string;
    fields: string[];
}
export const defaults: Partial<ValidationOptions> = {
    first: true,
    trigger: undefined,
    fields: undefined
};

export type ValidationCallback = (fault: Fault | null, valid: boolean) => void;

const isEmpty = (value: any): boolean => {
    if (isUndefined(value) || isNull(value) || value === '') return true;

    if (arrayLike(value)) return value.length === 0;

    if (isObject(value)) return Object.keys(value).length === 0;

    return false;
};

const messageGetter = (
    messageFunc: string | ValidationMessageFunc,
    message?: ValidationMessage
): ValidationMessageFunc => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (isFunction(message)) return message;

    if (isString(message)) return (value, source, rule, schema, msgData) => stringAssign(message, msgData);

    if (isString(messageFunc)) return (value, source, rule, schema, msgData) => stringAssign(messageFunc, msgData);

    return messageFunc;
};

const limitsGetter1 = <Limit1>(limit1: ValidationLimit<Limit1>): ValidationLimitsFunc<[Limit1]> => {
    if (isFunction(limit1))
        return (value, source, rule, schema) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            [limit1(value, source, rule, schema)];

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return () => [limit1];
};

const limitsGetter2 = <Limit1, Limit2>(
    limit1: ValidationLimit<Limit1>,
    limit2: ValidationLimit<Limit2>
): ValidationLimitsFunc<[Limit1, Limit2]> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return (value, source, rule, schema) => {
        const realLimit1 = isFunction(limit1) ? limit1(value, source, rule, schema) : limit1;
        const realLimit2 = isFunction(limit2) ? limit2(value, source, rule, schema) : limit2;

        return [realLimit1, realLimit2];
    };
};

const matcherToValidator = (matcher: ValidationMatcher): ValidationAsyncValidator => {
    return async (value, source, rule, schema, limits): Promise<boolean> => {
        const result = await matcher(value, source, rule, schema, limits);

        // 返回字符串
        if (isString(result)) {
            throw new Error(result);
        }

        // 返回一个错误对象
        if (isError(result)) {
            throw result;
        }

        // 返回一个布尔值
        if (isBoolean(result)) {
            return result;
        }

        return true;
    };
};

const matchSymbol = (obj: any) => {
    if (!isObject(obj)) return false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (obj[VALIDATION_FLAG] === VALIDATION_FLAG) return true;
    return Object.getOwnPropertySymbols(obj).some((symbol) => String(symbol) === String(VALIDATION_FLAG));
};

const isValidationRules = (rules: AsyncValidatorRuleItem | AsyncValidatorRuleItem[] | ValidationRules): boolean => {
    if (isObject(rules)) return false;

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (rules.length === 0) return false;

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return matchSymbol(rules[0]);
};

const isValidationSchema = (schema: any): schema is ValidationSchema => {
    return matchSymbol(schema);
};

const isValidationInstance = (v: any): v is Validation => {
    return matchSymbol(v);
};

export default class Validation {
    private _currentField?: string;
    private _currentLabel?: string;
    private _currentRule?: ValidationRule;
    private _currentRuleList?: Array<ValidationRule>;
    private _currentDesc?: ValidationDesc;
    private _fieldList: string[];
    private [VALIDATION_FLAG]: typeof VALIDATION_FLAG;
    private _schema: ValidationSchema;

    // 是否为独立模式，只导出验证规则，没有字段关联
    private _standaloneField: string;

    constructor() {
        this[VALIDATION_FLAG] = VALIDATION_FLAG;
        this._schema = {
            [VALIDATION_FLAG]: VALIDATION_FLAG
        };
        this._fieldList = [];
        this._standaloneField = '';
    }

    static create(): Validation {
        return new Validation();
    }

    /**
     * 导出所有字段的表单验证模式
     * @returns {ValidationSchema}
     */
    exportSchema(): ValidationSchema {
        return this._schema;
    }

    /**
     * 导入所有字段的验证模式
     * @param {ValidationSchema} schema
     * @returns {Validation}
     */
    importSchema(schema: ValidationSchema): Validation {
        this._schema = schema;
        this._fieldList = Object.keys(schema);
        return this;
    }

    /**
     * 导出指定字段的验证描述
     * @param {string} field
     * @returns {ValidationDesc}
     */
    exportDesc(field: string): ValidationDesc {
        const { _schema } = this;

        let found: ValidationDesc = { [VALIDATION_FLAG]: VALIDATION_FLAG, field, rules: [], usable: () => true };

        objectEach(_schema, (desc, _field) => {
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
    get rules(): ValidationRules {
        const { _standaloneField } = this;

        if (_standaloneField === '') throw new Error('非独立模式不能获取验证规则');

        return this.exportDesc(_standaloneField).rules;
    }

    /**
     * 独立模式，只能导出配置的验证规则
     * @returns {Validation}
     */
    public standalone(): Validation {
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
    public field(field: string): Validation {
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
    public label(label: string): Validation {
        const { _currentDesc } = this;

        if (!_currentDesc) throw new Error('必须先指定验证字段');

        this._currentLabel = label;
        _currentDesc.label = label;

        return this;
    }

    /**
     * 寻找验证规则中是否有某个规则
     * @param {ValidationMemberName} type
     * @returns {boolean}
     */
    has(type: ValidationMemberName): boolean {
        const { _currentRuleList } = this;
        console.log(type, 'type')
        if (!_currentRuleList) throw new Error('必须先指定验证字段');

        return _currentRuleList.some((rule) => rule.type === type);
    }

    /**
     * 必填验证
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    public required(message?: ValidationMessage): Validation {
        this._createRule('required', {
            validator: (value) => !isEmpty(value),
            limits: limitsGetter1(true),
            message: messageGetter(MEMBER_MESSAGES.required, message)
        });
        this._pushRule();
        console.log(this, 'this')
        return this;
    }

    /**
     * 数据类型验证
     * @param {ValidationLimit<ValidationTypeName>} type
     * @param {ValidationMessage} message
     * @returns {Validation}
     */
    public type(type: ValidationLimit<ValidationTypeName>, message?: ValidationMessage): Validation {
        this._createRule('type', {
            validator: (value, source, rule, schema, msgData) => {
                if (isUndefined(value) || isNull(value)) return true;

                const [type] = msgData.limits;
                return TYPE_VALIDATORS[type as ValidationTypeName](value);
            },
            limits: limitsGetter1(type),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const type = TYPE_NAME_MAP[msgData.limits[0] as ValidationTypeName];
                return stringAssign('${field}必须是' + type + '类型', msgData);
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
    public format(format: ValidationLimit<ValidationFormatName>, message?: ValidationMessage): Validation {
        this._createRule('format', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [format] = msgData.limits;
                return FORMAT_VALIDATORS[format as ValidationFormatName](value);
            },
            limits: limitsGetter1<ValidationFormatName>(format),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const type = FORMAT_NAME_MAP[msgData.limits[0] as ValidationFormatName];
                return stringAssign('${field}必须是' + type + '格式', msgData);
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
    public min(min: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('min', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [min] = msgData.limits as number[];
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
    public max(max: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('max', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [max] = msgData.limits as number[];
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
    public range(min: ValidationLimit<number>, max: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('range', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [min, max] = msgData.limits as number[];
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
    public minLength(minLength: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('minLength', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [minLength] = msgData.limits as number[];
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
    public maxLength(maxLength: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('maxLength', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [maxLength] = msgData.limits as number[];
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
    public flex(
        minLength: ValidationLimit<number>,
        maxLength: ValidationLimit<number>,
        message?: ValidationMessage
    ): Validation {
        this._createRule('flex', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const { length } = value;
                const [minLength, maxLength] = msgData.limits as number[];
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
    public length(length: ValidationLimit<number>, message?: ValidationMessage): Validation {
        this._createRule('length', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

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
    public enum(enums: ValidationLimit<AnyArray>, message?: ValidationMessage): Validation {
        this._createRule('length', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [enums] = msgData.limits;
                return (enums as AnyArray).some((match) => match === value);
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
    public pattern(pattern: ValidationLimit<RegExp | string>, message?: ValidationMessage): Validation {
        this._createRule('pattern', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [pattern] = msgData.limits;

                if (isRegExp(pattern)) return pattern.test(value);

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
    public same(field: ValidationLimit<string>, message?: ValidationMessage): Validation {
        this._createRule('same', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

                const [field] = msgData.limits as string[];
                return value === source[field];
            },
            limits: limitsGetter1(field),
            message: messageGetter((value, source, rule, schema, msgData) => {
                const field = msgData.limits[0];
                const desc = schema[field as string];
                const target = desc ? desc.label || desc.field : field;
                return stringAssign('${field}必须与' + target + '相同', msgData);
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
    public equal(match: ValidationLimit<any>, message?: ValidationMessage): Validation {
        this._createRule('equal', {
            validator: (value, source, rule, schema, msgData) => {
                if (isEmpty(value)) return true;

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
    public match(matcher: ValidationMatcher, message?: ValidationMessage): Validation {
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
    public add(rules: Validation): Validation {
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
    public enable(enable: ValidationEnable): Validation {
        const { _currentRule } = this;

        if (!_currentRule) throw new Error('必须先指定验证规则');

        _currentRule.enable = isFunction(enable) ? enable : () => enable;

        return this;
    }

    /**
     * 指定触发条件
     * @param {string} triggers
     * @returns {Validation}
     */
    public trigger(...triggers: string[]): Validation {
        const { _currentRule } = this;

        if (!_currentRule) throw new Error('必须先指定验证规则');

        _currentRule.triggers = triggers;

        return this;
    }

    /**
     * 验证字段是否生效
     * @param {ValidationUsable} usable
     * @returns {Validation}
     */
    public usable(usable: ValidationUsable): Validation {
        const { _currentDesc } = this;

        if (!_currentDesc) throw new Error('必须先指定验证字段');
        _currentDesc.usable = isFunction(usable) ? usable : () => usable;

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
    public validate(
        source: AnyObject,
        options?: Partial<ValidationOptions> | ValidationCallback,
        callback?: ValidationCallback
    ): Promise<boolean> | void {
        const faultify = (faults: Fault[]): Fault => new Fault({ message: faults[0].message, faults });
        const callbackMode = (options: Partial<ValidationOptions>, callback: ValidationCallback): void => {
            this._validate(source, options).then((faults) => {
                if (faults.length === 0) {
                    callback(null, true);
                    return;
                }

                callback(faultify(faults), false);
            });
        };
        const promiseMode = (options: Partial<ValidationOptions>): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                this._validate(source, options).then((faults) => {
                    if (faults.length === 0) return resolve(true);

                    reject(faultify(faults));
                });
            });
        };

        // validate(source, options, callback);
        if (isObject(options) && isFunction(callback)) {
            return callbackMode(options, callback);
        }

        // validate(source, options);
        if (isObject(options)) {
            return promiseMode(options);
        }

        // validate(source, callback);
        if (isFunction(options)) {
            return callbackMode({}, options);
        }

        return promiseMode({});
    }

    public destroy(): void {
        (this._fieldList as any) = null;
        (this._schema as any) = null;
        (this._currentDesc as any) = null;
        (this._currentField as any) = null;
        (this._currentLabel as any) = null;
    }

    private _createRule(type: ValidationMemberName, assigned: Partial<ValidationRule>): ValidationRule {
        if (!this._currentField) throw new Error('必须先指定验证字段');

        const rule = objectAssign<ValidationRule>(
            {
                [VALIDATION_FLAG]: VALIDATION_FLAG,
                type,
                triggers: [],
                limits: () => [],
                enable: () => true
            },
            assigned
        );
        this._currentRule = rule;

        return rule;
    }

    private _pushRule(): void {
        (this._currentRuleList as ValidationRules).push(this._currentRule as ValidationRule);
    }

    private async _validate(source: AnyObject, options: Partial<ValidationOptions>): Promise<Fault[]> {
        const faults: Fault[] = [];
        const opts = objectAssign<ValidationOptions>({}, defaults, options);
        const { first, fields, trigger } = opts;
        const { _schema: schema } = this;
        const exitable = (): boolean => (first === true ? faults.length === 1 : false);
        const fieldTest = (field: string): boolean => {
            if (!isArray(fields)) return true;

            return fields.some((item) => item === field);
        };
        const usableTest = (field: string): boolean => {
            const value = source[field];
            const { usable } = schema[field];

            return usable(value, source, schema);
        };
        const enableTest = (value: any, rule: ValidationRule, msgData: ValidationMsgData): boolean => {
            const { enable, limits } = rule;
            return enable(value, source, rule, schema, msgData);
        };
        const triggerTest = (
            trigger: string | undefined,
            rule: ValidationRule,
            msgData: ValidationMsgData
        ): boolean => {
            if (!isString(trigger)) return true;
            if (trigger.length === 0) return true;

            const { triggers } = rule;

            if (triggers.length === 0) return true;

            return triggers.some((item) => item === trigger);
        };
        const validate = async (
            field: string,
            value: any,
            rule: ValidationRule,
            desc: ValidationDesc,
            msgData: ValidationMsgData
        ): Promise<void> => {
            const { validator, message, type } = rule;
            const { label } = desc;
            const pushFault = (message: ValidationMessage): void => {
                let realMessage: string;

                if (isString(message)) realMessage = stringAssign(message, msgData);
                else realMessage = message(value, source, rule, schema, msgData);

                faults.push(
                    new Fault({
                        message: realMessage,
                        field,
                        label,
                        type
                    })
                );
            };

            if (!isFunction(validator)) return;

            try {
                const invalid = await validator(value, source, rule, schema, msgData);

                if (invalid === false) {
                    pushFault(message);
                }
            } catch (err) {
                if (isString(err)) pushFault(err);
                else pushFault(err.message);
            }
        };

        for (const field of this._fieldList) {
            if (fieldTest(field) === false) continue;

            if (usableTest(field) === false) continue;

            const desc = schema[field];
            const value = source[field];
            const { rules, label } = desc;

            for (const rule of rules) {
                const { type, limits } = rule;
                const realLimits = limits(value, source, rule, schema);
                const msgData: ValidationMsgData = {
                    type,
                    field: label || field,
                    limits: realLimits
                };

                if (enableTest(value, rule, msgData) === false) continue;

                if (triggerTest(trigger, rule, msgData) === false) continue;

                await validate(field, value, rule, desc, msgData);

                if (exitable()) break;
            }

            if (exitable()) break;
        }

        return faults;
    }
}

/**
 * 导入表单验证模式，兼容 async-validator
 * @param {AsyncValidatorRules | ValidationSchema<AnyArray>} schema
 * @returns {Validation}
 */
export const importSchema = (schema: AsyncValidatorRules | ValidationSchema): Validation => {
    const v = new Validation();

    if (isValidationSchema(schema)) {
        v.importSchema(schema);
        return v;
    }

    const ASYNC_VALIDATION_TYPE_TO_TYPE: Partial<AsyncValidatorTypeMapping> = {
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
    const ASYNC_VALIDATION_TYPE_TO_FORMAT: Partial<AsyncValidatorTypeMapping> = {
        integer: 'integer',
        float: 'float',
        url: 'url',
        email: 'email'
    };

    const getType = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]) => {
        const foundTypeRule = rules.find((rule) => rule.type !== undefined);
        return rule.type || (foundTypeRule && foundTypeRule.type) || null;
    };

    const adaptRequiredRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { required, message, trigger } = rule;

        if (!required) return;

        v.required(message);

        if (trigger) v.trigger(trigger);
    };

    const adaptTypeRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const { type } = rule;

        if (!type) return;

        const { message, trigger } = rule;
        const thisType = ASYNC_VALIDATION_TYPE_TO_TYPE[type];

        if (!thisType) return;

        v.type(thisType as ValidationTypeName, message);

        if (trigger) v.trigger(trigger);
    };

    const adaptFormatRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { message, trigger } = rule;

        if (!type) return;

        const thisFormat = ASYNC_VALIDATION_TYPE_TO_FORMAT[type];

        if (!thisFormat) return;

        v.format(thisFormat as ValidationFormatName, message);

        if (trigger) v.trigger(trigger);
    };

    const adaptEnumRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { enum: enums, message, trigger } = rule;

        if (type !== 'enum' || !enums) return;

        v.enum(enums, message);

        if (trigger) v.trigger(trigger);
    };

    const adaptMinRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { min, message, trigger } = rule;

        if (!isNumber(min)) return;

        switch (type) {
            case 'string':
            case 'array':
                v.minLength(min, message);
                break;
            case 'number':
                v.min(min, message);
                break;
        }

        if (trigger) v.trigger(trigger);
    };

    const adaptMaxRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { max, message, trigger } = rule;

        if (!isNumber(max)) return;

        switch (type) {
            case 'string':
            case 'array':
                v.maxLength(max, message);
                break;
            case 'number':
                v.max(max, message);
                break;
        }

        if (trigger) v.trigger(trigger);
    };

    const adaptLenRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { len, message, trigger } = rule;

        if (!isNumber(len)) return;

        switch (type) {
            case 'string':
            case 'array':
                v.length(len, message);
                break;

            case 'number':
                v.equal(len, message);
                break;
        }

        if (trigger) v.trigger(trigger);
    };

    const adaptPattern = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { pattern, message, trigger } = rule;

        if (type !== 'string' || !pattern) return;

        v.pattern(pattern, message);

        if (trigger) v.trigger(trigger);
    };

    const adaptValidatorRule = (rule: AsyncValidatorRuleItem, rules: AsyncValidatorRuleItem[]): void => {
        const type = getType(rule, rules);
        const { validator, trigger } = rule;

        if (!isFunction(validator)) return;

        v.match(
            (value, source, rule1, schema1): Promise<boolean> => {
                return new Promise((resolve, reject) => {
                    validator(
                        rule as AsyncValidatorRules,
                        value,
                        (err: unknown) => {
                            if (err) return reject(err);

                            resolve(true);
                        },
                        source,
                        {}
                    );
                });
            }
        );

        if (trigger) v.trigger(trigger);
    };

    objectEach(schema, (asyncValidatorRules, field) => {
        v.field(field as string);

        // 当其中一个规则是一个 Validation 实例时，直接导入
        if (isValidationInstance(asyncValidatorRules)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            v._currentRuleList.push(...asyncValidatorRules.rules);
            return;
        }

        const _rules = isArray(asyncValidatorRules) ? asyncValidatorRules : [asyncValidatorRules];

        _rules.forEach((rule) => {
            const {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                [VALIDATION_FLAG]: flag,
                whitespace,
                fields,
                options,
                defaultField,
                transform,
                asyncValidator
            } = rule;

            if (flag === VALIDATION_FLAG) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                v._currentRuleList.push(rule);
                return;
            }

            if (whitespace || fields || options || defaultField || transform || asyncValidator)
                throw new Error(
                    '暂不支持 whitespace、fields、options、defaultField、transform、asyncValidator 规则导入'
                );

            adaptRequiredRule(rule, _rules);
            adaptTypeRule(rule, _rules);
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
export const importRules = (
    field: string,
    rules: AsyncValidatorRuleItem | AsyncValidatorRuleItem[] | ValidationRules | Validation
): Validation => {
    // 直接导入的是 validation 实例
    if (isValidationInstance(rules)) {
        return importRules(field, rules.rules);
    }

    if (isValidationRules(rules as ValidationRules)) {
        const schema = {
            [field]: {
                field,
                rules: rules,
                usable: () => true,
                [VALIDATION_FLAG]: VALIDATION_FLAG
            },
            [VALIDATION_FLAG]: VALIDATION_FLAG
        };
        return importSchema(schema as ValidationSchema);
    }

    const rules2 = isObject(rules) ? [rules] : rules;
    const schema = { [field]: rules2 };
    return importSchema(schema as AsyncValidatorRules);
};

const create = (member: ValidationMemberName, args: AnyArray) => {
    const v = new Validation().standalone();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return v[member].call(v, ...args);
};

type Va = {
    required: Validation['required'];
    type: Validation['type'];
    format: Validation['format'];
    min: Validation['min'];
    max: Validation['max'];
    range: Validation['range'];
    minLength: Validation['minLength'];
    maxLength: Validation['maxLength'];
    length: Validation['length'];
    flex: Validation['flex'];
    enum: Validation['enum'];
    pattern: Validation['pattern'];
    same: Validation['same'];
    equal: Validation['equal'];
    match: Validation['match'];
    add: Validation['add'];
};

const members: ValidationMemberName[] = [
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
export const va: Va = {};
members.forEach((member) => {
    console.log(member, 'member')
    va[member] = (...args: AnyArray) => {
        return create(member, args);
    };
});
console.log(va.required, 'va')
