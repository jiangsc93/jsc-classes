import Fault from '../src/fault';
import Validation, { importRules, importSchema, va } from '../src/validation';

// test('#field', () => {
//     const v = new Validation();
//     console.log(v, 'v')
//     v.field('a');
//     v.field('b');

//     const schema = v.exportSchema();
//     console.log(schema, 'schema')
//     expect(schema.a.rules).toEqual([]);
//     expect(schema.b.rules).toEqual([]);
// });

// test('#label', () => {
//     const v = new Validation();

//     v.field('a').label('安安1');
//     v.field('b');
//     v.field('c');
//     v.field('a').label('安安2');
//     v.field('a');
//     v.field('c').label('从从1');

//     const schema = v.exportSchema();

//     console.log(schema, 'schema')

//     expect(schema.a.label).toBe('安安2');
//     expect(schema.b.label).toBe(undefined);
//     expect(schema.c.label).toBe('从从1');
//     expect(schema.a.rules).toEqual([]);
//     expect(schema.b.rules).toEqual([]);
//     expect(schema.c.rules).toEqual([]);
// });

// test('#has', () => {
//     const v = new Validation();

//     v.field('a').required();
//     v.field('b').maxLength(12);
//     console.log(v, 'v')
//     expect(v.field('a').has('required')).toBe(true);
//     expect(v.field('a').has('max')).toBe(false);
// });

// test('#getSchema', () => {
//     const v = new Validation();

//     v.field('a').required();
//     v.field('b').maxLength(12);

//     const schema = v.exportSchema();
//     expect(schema.a.rules).toHaveLength(1);
//     expect(schema.b.rules).toHaveLength(1);
// });

// test('#getDesc', () => {
//     const v = new Validation();

//     v.field('a').required();
//     v.field('b').maxLength(12);

//     const desc1 = v.exportDesc('a');
//     expect(desc1).not.toBe(null);
//     expect(desc1?.rules).toHaveLength(1);

//     const desc2 = v.exportDesc('c');
//     expect(desc2.rules).toEqual([]);
// });

// test('#field 交叉', () => {
//     const v = new Validation();

//     v.field('a').type('string');
//     v.field('b').type('string');
//     v.field('a').required();
//     v.field('c').required();
//     v.field('a').minLength(6);
//     v.field('b').minLength(6).maxLength(12);

//     const schema = v.exportSchema();
//     expect(schema.a.rules.length).toBe(3);
//     expect(schema.b.rules.length).toBe(3);
//     expect(schema.c.rules.length).toBe(1);
//     expect(Object.keys(schema)).toEqual(['a', 'b', 'c']);
// });

// test('#required', async () => {
//     const v = new Validation();

//     v.field('a').required();

//     await expect(v.validate({ a: '' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: undefined })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: null })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: [] })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: {} })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: 0 })).resolves.toBe(true);
//     await expect(v.validate({ a: false })).resolves.toBe(true);
//     await expect(v.validate({ a: true })).resolves.toBe(true);
//     await expect(v.validate({ a: '0' })).resolves.toBe(true);
// });

test('#type static', async () => {
    const v = new Validation();

    v.field('a').label('啊啊').type('string');
    v.field('b').label('不不').type('number');
    v.field('c').label('从从').type('boolean');
    v.field('d').label('得得').type('object');
    v.field('e').label('嗯嗯').type('array');

    await expect(v.validate({ a: 2 })).rejects.toThrow('啊啊必须是字符串类型');
    await expect(v.validate({ a: '', b: '1' })).rejects.toThrow('不不必须是数值类型');
    await expect(v.validate({ a: '', b: 1, c: 1 })).rejects.toThrow('从从必须是布尔值类型');
    await expect(v.validate({ a: '', b: 1, c: true, d: '' })).rejects.toThrow('得得必须是对象类型');
    await expect(v.validate({ a: '', b: 1, c: true, d: {}, e: '' })).rejects.toThrow('嗯嗯必须是数组类型');
    const valid = await v.validate({ a: '1', b: 1, c: true, d: {}, e: [] });
    expect(valid).toBe(true);
});

// test('#type dynamic', async () => {
//     const v = new Validation();
//     let isString = false;

//     v.field('a').type(() => (isString ? 'string' : 'number'));

//     await expect(v.validate({ a: true })).rejects.toThrow('a必须是数值类型');
//     await expect(v.validate({ a: 1 })).resolves.toBe(true);
//     isString = true;
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a必须是字符串类型');
// });

// test('#format static', async () => {
//     const v = new Validation();
//     const url = 'http://123.com';
//     const email = 'abc@123.com';
//     const phone = '13312345678';
//     const ipv4 = '1.1.1.1';
//     const idNo = '140622200201019698';

//     v.field('a').label('啊啊').format('url');
//     v.field('b').label('不不').format('email');
//     v.field('c').label('从从').format('phone');
//     v.field('d').label('得得').format('ipv4');
//     v.field('e').label('嗯嗯').format('idNo');
//     v.field('f').format('integer');
//     v.field('g').format('float');
//     v.field('h').format('numerical');
//     v.field('i').format('digit');

//     await expect(v.validate({ a: 2 })).rejects.toThrow('啊啊必须是 URL 地址格式');
//     await expect(v.validate({ a: '2' })).rejects.toThrow('啊啊必须是 URL 地址格式');
//     await expect(v.validate({ a: url, b: '1' })).rejects.toThrow('不不必须是邮箱格式');
//     await expect(v.validate({ a: url, b: email, c: '1' })).rejects.toThrow('从从必须是手机号码格式');
//     await expect(v.validate({ a: url, b: email, c: phone, d: '2' })).rejects.toThrow('得得必须是 IP 地址格式');
//     await expect(v.validate({ a: url, b: email, c: phone, d: ipv4, e: '3' })).rejects.toThrow(
//         '嗯嗯必须是身份证号码格式'
//     );
//     await expect(v.validate({ a: url, b: email, c: phone, d: ipv4, e: idNo, f: 'x' })).rejects.toThrow(
//         'f必须是整数格式'
//     );
//     await expect(v.validate({ a: url, b: email, c: phone, d: ipv4, e: idNo, f: '123', g: 'x' })).rejects.toThrow(
//         'g必须是浮点数格式'
//     );
//     await expect(
//         v.validate({ a: url, b: email, c: phone, d: ipv4, e: idNo, f: '123', g: '123.456', h: 'x' })
//     ).rejects.toThrow('h必须是数值格式');
//     await expect(
//         v.validate({ a: url, b: email, c: phone, d: ipv4, e: idNo, f: '123', g: '123.456', h: '123.456', i: 'xx' })
//     ).rejects.toThrow('i必须是数字格式');
//     const valid = await v.validate({
//         a: url,
//         b: email,
//         c: phone,
//         d: ipv4,
//         e: idNo,
//         f: '123',
//         g: '123.456',
//         h: '123.456',
//         i: '012345'
//     });
//     expect(valid).toBe(true);
// });

// test('#format dynamic', async () => {
//     const v = new Validation();
//     let isEmail = true;

//     v.field('a').format(() => (isEmail ? 'email' : 'phone'));

//     await expect(v.validate({ a: '133' })).rejects.toThrow('a必须是邮箱格式');
//     await expect(v.validate({ a: '13312345678@123.com' })).resolves.toBe(true);
//     isEmail = false;
//     await expect(v.validate({ a: '13312345678' })).resolves.toBe(true);
// });

// test('#format integer/float/digit', async () => {
//     const v = new Validation();

//     v.field('a').format('integer');
//     v.field('b').format('float');
//     v.field('c').format('digit');

//     await expect(v.validate({ a: 1, b: 1.2, c: 3 })).resolves.toBe(true);
//     await expect(v.validate({ a: '1', b: '1.2', c: '3' })).resolves.toBe(true);
// });

// test('#min/#max static', async () => {
//     const v = new Validation();

//     v.field('a').min(10).max(100);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a不能小于 10');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a不能大于 100');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#min/#max dynamic', async () => {
//     const v = new Validation();

//     v.field('a')
//         .min(() => 10)
//         .max(() => 100);

//     await expect(v.validate({ a: null })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a不能小于 10');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a不能大于 100');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#range static', async () => {
//     const v = new Validation();

//     v.field('a').range(10, 100);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#range left dynamic', async () => {
//     const v = new Validation();

//     v.field('a').range(() => 10, 100);

//     await expect(v.validate({ a: null })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#range right dynamic', async () => {
//     const v = new Validation();

//     v.field('a').range(10, () => 100);

//     await expect(v.validate({ a: null })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#range full dynamic', async () => {
//     const v = new Validation();

//     v.field('a').range(
//         () => 10,
//         () => 100
//     );

//     await expect(v.validate({ a: null })).resolves.toBe(true);
//     await expect(v.validate({ a: 1 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a必须在 10-100 之间');
//     await expect(v.validate({ a: 99 })).resolves.toBe(true);
// });

// test('#minLength/#maxLength left dynamic', async () => {
//     const v = new Validation();

//     v.field('a')
//         .minLength(() => 3)
//         .maxLength(5);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不能少于 3 个长度');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a不能超过 5 个长度');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#minLength/#maxLength right dynamic', async () => {
//     const v = new Validation();

//     v.field('a')
//         .minLength(3)
//         .maxLength(() => 5);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不能少于 3 个长度');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a不能超过 5 个长度');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#flex static', async () => {
//     const v = new Validation();

//     v.field('a').flex(3, 5);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#flex left dynamic', async () => {
//     const v = new Validation();

//     v.field('a').flex(() => 3, 5);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#flex right dynamic', async () => {
//     const v = new Validation();

//     v.field('a').flex(3, () => 5);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#flex full dynamic', async () => {
//     const v = new Validation();

//     v.field('a').flex(
//         () => 3,
//         () => 5
//     );

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '123456' })).rejects.toThrow('a必须是 3-5 个长度之间');
//     await expect(v.validate({ a: '1234' })).resolves.toBe(true);
// });

// test('#length static', async () => {
//     const v = new Validation();

//     v.field('a').length(3);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3 个长度');
//     await expect(v.validate({ a: '123' })).resolves.toBe(true);
//     await expect(v.validate({ a: [1, 2, 3] })).resolves.toBe(true);
// });

// test('#length dynamic', async () => {
//     const v = new Validation();

//     v.field('a').length(() => 3);

//     await expect(v.validate({ a: undefined })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3 个长度');
//     await expect(v.validate({ a: '123' })).resolves.toBe(true);
//     await expect(v.validate({ a: [1, 2, 3] })).resolves.toBe(true);
// });

// test('#enum static', async () => {
//     const v = new Validation();

//     v.field('sex').enum(['male', 'female']);

//     await expect(v.validate({ sex: undefined })).resolves.toBe(true);
//     await expect(v.validate({ sex: 'boy' })).rejects.toThrow('sex必须是male、female之一');
//     await expect(v.validate({ sex: 'male' })).resolves.toBe(true);
//     await expect(v.validate({ sex: 'female' })).resolves.toBe(true);
// });

// test('#enum dynamic', async () => {
//     const v = new Validation();

//     v.field('sex').enum(() => ['male', 'female']);

//     await expect(v.validate({ sex: undefined })).resolves.toBe(true);
//     await expect(v.validate({ sex: 'boy' })).rejects.toThrow('sex必须是male、female之一');
//     await expect(v.validate({ sex: 'male' })).resolves.toBe(true);
//     await expect(v.validate({ sex: 'female' })).resolves.toBe(true);
// });

// test('#pattern static', async () => {
//     const v = new Validation();

//     v.field('a').pattern(/^[a-z]{3,6}$/);
//     v.field('b').pattern('ef');

//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不合法');
//     await expect(v.validate({ a: 'abc' })).resolves.toBe(true);
//     await expect(v.validate({ a: 'abc', b: 'd' })).rejects.toThrow('b不合法');
//     await expect(v.validate({ a: 'abc', b: 'defg' })).resolves.toBe(true);
// });

// test('#pattern dynamic', async () => {
//     const v = new Validation();

//     v.field('a').pattern(() => /^[a-z]{3,6}$/);
//     v.field('b').pattern(() => 'ef');

//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不合法');
//     await expect(v.validate({ a: 'abc' })).resolves.toBe(true);
//     await expect(v.validate({ a: 'abc', b: 'd' })).rejects.toThrow('b不合法');
//     await expect(v.validate({ a: 'abc', b: 'defg' })).resolves.toBe(true);
// });

// test('#same static', async () => {
//     const v = new Validation();

//     v.field('p1').label('密码').type('string').required().minLength(6).maxLength(32);
//     v.field('p2').label('确认密码').type('string').required().same('p1');
//     v.field('p3').label('再次密码').same('p4');

//     await expect(v.validate({ p1: 'abcdef', p2: 'abc' })).rejects.toThrow('确认密码必须与密码相同');
//     await expect(v.validate({ p1: 'abcdef', p2: 'abcdef', p3: 'abc' })).rejects.toThrow('再次密码必须与p4相同');
//     await expect(v.validate({ p1: 'abcdef', p2: 'abcdef', p3: 'abc', p4: 'abc' })).resolves.toBe(true);
// });

// test('#same dynamic', async () => {
//     const v = new Validation();

//     v.field('age').type('number');
//     v.field('hobby').enum(
//         (value, source) => (source.age < 18 ? ['绘画', '书法', '钢琴'] : ['足球', '游戏', '蹦迪']),
//         (value, source) => {
//             return source.age < 18 ? '18 岁以前的爱好只能选择绘画/书法/钢琴' : '18 岁以后的爱好可以选择足球/游戏/蹦迪';
//         }
//     );

//     await expect(v.validate({ age: 12, hobby: 'abc' })).rejects.toThrow('18 岁以前的爱好只能选择绘画/书法/钢琴');
//     await expect(v.validate({ age: 12, hobby: '绘画' })).resolves.toBe(true);
//     await expect(v.validate({ age: 22, hobby: 'abc' })).rejects.toThrow('18 岁以后的爱好可以选择足球/游戏/蹦迪');
//     await expect(v.validate({ age: 22, hobby: '游戏' })).resolves.toBe(true);
// });

// test('#equal static', async () => {
//     const v = new Validation();

//     v.field('a').equal('password');

//     await expect(v.validate({ a: '' })).resolves.toBe(true);
//     await expect(v.validate({ a: '123' })).rejects.toThrow('a不正确');
//     await expect(v.validate({ a: 'password' })).resolves.toBe(true);
// });

// test('#equal dynamic', async () => {
//     const v = new Validation();

//     v.field('a').equal(() => 'password');

//     await expect(v.validate({ a: '' })).resolves.toBe(true);
//     await expect(v.validate({ a: '123' })).rejects.toThrow('a不正确');
//     await expect(v.validate({ a: 'password' })).resolves.toBe(true);
// });

// test('#match sync', async () => {
//     const v = new Validation();

//     v.field('a').match((v) => {
//         if ('2' === v) return true;

//         throw new Error('用户名必须等于 2');
//     });
//     v.field('b').match((v) => {
//         if ('2' === v) return true;

//         throw '${field}必须等于 2';
//     }, '嘚嘚嘚');
//     v.field('c').match((v) => '2' === v || '${field}必须等于 2');
//     v.field('d').match((v) => '2' === v, '${field}必须等于 2');
//     v.field('e').match((v) => '2' === v);
//     v.field('f').match((v) => '2' === v || '巴拉巴拉', '阿巴阿巴');

//     await expect(v.validate({ a: '1' })).rejects.toThrow('用户名必须等于 2');
//     await expect(v.validate({ a: '2', b: '1' })).rejects.toThrow('b必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '1' })).rejects.toThrow('c必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '1' })).rejects.toThrow('d必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '1' })).rejects.toThrow('e不符合规则');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '2', f: '1' })).rejects.toThrow('巴拉巴拉');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '2', f: '2' })).resolves.toBe(true);
// });

// test('#match async', async () => {
//     const v = new Validation();

//     v.field('a').match((v) => {
//         if ('2' === v) return true;

//         throw new Error('用户名必须等于 2');
//     });
//     v.field('b').match((v) => {
//         if ('2' === v) return true;

//         throw '${field}必须等于 2';
//     }, '嘚嘚嘚');
//     v.field('c').match((v) => '2' === v || '${field}必须等于 2');
//     v.field('d').match((v) => '2' === v, '${field}必须等于 2');
//     v.field('e').match((v) => '2' === v);
//     v.field('f').match((v) => '2' === v || '巴拉巴拉', '阿巴阿巴');

//     await expect(v.validate({ a: '1' })).rejects.toThrow('用户名必须等于 2');
//     await expect(v.validate({ a: '2', b: '1' })).rejects.toThrow('b必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '1' })).rejects.toThrow('c必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '1' })).rejects.toThrow('d必须等于 2');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '1' })).rejects.toThrow('e不符合规则');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '2', f: '1' })).rejects.toThrow('巴拉巴拉');
//     await expect(v.validate({ a: '2', b: '2', c: '2', d: '2', e: '2', f: '2' })).resolves.toBe(true);
// });

// test('#match promise', async () => {
//     const v = new Validation();

//     v.field('a').match(
//         (value) =>
//             new Promise((resolve, reject) => {
//                 if (value.startsWith('admin')) return resolve(true);

//                 reject(new Error('用户名必须以“admin”开头'));
//             })
//     );

//     await expect(v.validate({ a: '1' })).rejects.toThrow('用户名必须以“admin”开头');
//     await expect(v.validate({ a: 'admin' })).resolves.toBe(true);
// });

// test('#match return string', async () => {
//     const v = new Validation();
//     v.field('a').match((value) => value > 0 || '${field}必须大于0');
//     await expect(v.validate({ a: -1 })).rejects.toThrow('a必须大于0');
//     await expect(v.validate({ a: 1 })).resolves.toBe(true);
// });

// test('#match return Error', async () => {
//     const v = new Validation();
//     v.field('a').match((value) => value > 0 || new Error('${field}必须大于0'));
//     await expect(v.validate({ a: -1 })).rejects.toThrow('a必须大于0');
//     await expect(v.validate({ a: 1 })).resolves.toBe(true);
// });

// test('#match return boolean', async () => {
//     const v = new Validation();
//     v.field('a').match((value) => value > 0);
//     await expect(v.validate({ a: -1 })).rejects.toThrow('a不符合规则');
//     await expect(v.validate({ a: 1 })).resolves.toBe(true);
// });

// test('#match return undefined', async () => {
//     const v = new Validation();
//     v.field('a').match((value) => {
//         if (value < 0) throw new Error('${field}不符合规则');
//     });
//     await expect(v.validate({ a: -1 })).rejects.toThrow('a不符合规则');
//     await expect(v.validate({ a: 1 })).resolves.toBe(true);
// });

// interface Source1 {
//     a: number;
//     b: number;
// }
// test('#add', async () => {
//     // 1、先定义一串规则：必填，最小值 1，最大值 100
//     const rules = va.required().type('number').min(1).max(100);
//     const v = new Validation();

//     // 2、增加规则，然后定义关联规则：b 不能小于 a
//     v.field('a').add(rules);
//     v.field('b')
//         .add(rules)
//         .min(1)
//         .min((value, source) => source.a, 'b 不能小于 a');

//     await expect(v.validate({})).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是数值类型');
//     await expect(v.validate({ a: -1 })).rejects.toThrow('a不能小于 1');
//     await expect(v.validate({ a: 111 })).rejects.toThrow('a不能大于 100');

//     await expect(v.validate({ a: 12 })).rejects.toThrow('b不能为空');
//     await expect(v.validate({ a: 12, b: '1' })).rejects.toThrow('b必须是数值类型');
//     await expect(v.validate({ a: 12, b: -1 })).rejects.toThrow('b不能小于 1');
//     await expect(v.validate({ a: 12, b: 111 })).rejects.toThrow('b不能大于 100');

//     await expect(v.validate({ a: 12, b: 11 })).rejects.toThrow('b 不能小于 a');
//     await expect(v.validate({ a: 12, b: 13 })).resolves.toBe(true);
// });

// test('#enable', async () => {
//     const v = new Validation();

//     v.field('a').required().enable(false);

//     await expect(v.validate({})).resolves.toBe(true);
// });

// test('#enable 典型应用', async () => {
//     const v = new Validation();

//     // 账号类型：邮箱/手机号
//     v.field('type')
//         .label('账号类型')
//         .required()
//         .type('string')
//         .enum(['email', 'phone'], '${field}必须是邮箱或者手机号');
//     v.field('account')
//         .label('账号地址')
//         .required()
//         .format('email')
//         .enable((value, source) => source.type === 'email')
//         .format('phone')
//         .enable((value, source) => source.type === 'phone');

//     const d1 = {};
//     await expect(v.validate(d1)).rejects.toThrow('账号类型不能为空');

//     const d2 = { type: 1, account: '' };
//     await expect(v.validate(d2)).rejects.toThrow('账号类型必须是字符串类型');

//     const d3 = { type: '1', account: '' };
//     await expect(v.validate(d3)).rejects.toThrow('账号类型必须是邮箱或者手机号');

//     const d4 = { type: 'email', account: '133' };
//     await expect(v.validate(d4)).rejects.toThrow('账号地址必须是邮箱格式');

//     const d5 = { type: 'phone', account: '' };
//     await expect(v.validate(d5)).rejects.toThrow('账号地址不能为空');

//     const d6 = { type: 'email', account: '' };
//     await expect(v.validate(d6)).rejects.toThrow('账号地址不能为空');

//     const d7 = { type: 'phone', account: '133' };
//     await expect(v.validate(d7)).rejects.toThrow('账号地址必须是手机号码格式');

//     const d8 = { type: 'email', account: '133@123.com' };
//     await expect(v.validate(d8)).resolves.toBe(true);

//     const d9 = { type: 'phone', account: '13312345678' };
//     await expect(v.validate(d9)).resolves.toBe(true);
// });

// test('#trigger', () => {
//     const v = new Validation();

//     v.field('a')
//         .required()
//         .trigger('change')
//         .minLength(6)
//         .trigger('focus')
//         .maxLength(12)
//         .enum([1, 2])
//         .trigger('blur', 'change');

//     const schema = v.exportSchema();
//     expect(schema.a.rules.length).toBe(4);
//     expect(schema.a.rules[0].triggers).toEqual(['change']);
//     expect(schema.a.rules[1].triggers).toEqual(['focus']);
//     expect(schema.a.rules[2].triggers).toEqual([]);
//     expect(schema.a.rules[3].triggers).toEqual(['blur', 'change']);
// });

// test('#usable', async () => {
//     const v = new Validation();

//     v.field('a').usable(false).required().minLength(3);

//     await expect(v.validate({ a: '' })).resolves.toBe(true);
// });

// test('#usable 典型应用', async () => {
//     const v = new Validation();

//     // 账号类型：邮箱/手机号
//     v.field('type')
//         .label('账号类型')
//         .required()
//         .type('string')
//         .enum(['email', 'phone'], '${field}必须是邮箱或者手机号');
//     v.field('email')
//         .usable((value, source) => source.type === 'email')
//         .required()
//         .format('email');
//     v.field('phone')
//         .usable((value, source) => source.type === 'phone')
//         .required()
//         .format('phone');

//     const d1 = {};
//     await expect(v.validate(d1)).rejects.toThrow('账号类型不能为空');

//     const d2 = { type: 1, account: '' };
//     await expect(v.validate(d2)).rejects.toThrow('账号类型必须是字符串类型');

//     const d3 = { type: '1', account: '' };
//     await expect(v.validate(d3)).rejects.toThrow('账号类型必须是邮箱或者手机号');

//     const d4 = { type: 'email', email: '133', phone: '133' };
//     await expect(v.validate(d4)).rejects.toThrow('email必须是邮箱格式');

//     const d5 = { type: 'phone', email: '133', phone: '133' };
//     await expect(v.validate(d5)).rejects.toThrow('phone必须是手机号码格式');

//     const d6 = { type: 'email', email: '133@133.com', phone: '133' };
//     await expect(v.validate(d6)).resolves.toBe(true);

//     const d7 = { type: 'phone', email: '133', phone: '13312345678' };
//     await expect(v.validate(d7)).resolves.toBe(true);
// });

// test('#validate callback 1 fault', () => {
//     return new Promise((done) => {
//         const v = new Validation();
//         const d = { a: '1' };

//         v.field('a').type('string').format('url');
//         v.validate(d, (fault, valid) => {
//             expect((fault as Fault).message).toBe('a必须是 URL 地址格式');
//             expect(valid).toBe(false);
//             done();
//         });
//     });
// });

// test('#validate callback 2 fault', () => {
//     return new Promise((done) => {
//         const v = new Validation();
//         const d = { a: '1' };

//         v.field('a').type('string').format('url');
//         v.validate(d, {}, (fault, valid) => {
//             expect((fault as Fault).message).toBe('a必须是 URL 地址格式');
//             expect(valid).toBe(false);
//             done();
//         });
//     });
// });

// test('#validate callback 1 valid', () => {
//     return new Promise((done) => {
//         const v = new Validation();
//         const d = { a: '123' };

//         v.field('a').required();
//         v.validate(d, (fault, valid) => {
//             expect(fault).toBe(null);
//             expect(valid).toBe(true);
//             done();
//         });
//     });
// });

// test('#validate callback 2 valid', () => {
//     return new Promise((done) => {
//         const v = new Validation();
//         const d = { a: '123' };

//         v.field('a').required();
//         v.validate(d, {}, (fault, valid) => {
//             expect(fault).toBe(null);
//             expect(valid).toBe(true);
//             done();
//         });
//     });
// });

// test('#validate promise', async () => {
//     const v = new Validation();
//     const d = {
//         a: 'x'
//     };

//     v.field('a').type('string').format('url');

//     await expect(v.validate(d, {})).rejects.toThrow('a必须是 URL 地址格式');
//     await expect(v.validate(d)).rejects.toThrow('a必须是 URL 地址格式');
// });

// test('#validate 指定 trigger', async () => {
//     const v = new Validation();

//     v.field('a').required().minLength(3).trigger('x').minLength(6).trigger('y').maxLength(9).trigger('x', 'y');

//     // 空 trigger
//     await expect(v.validate({ a: '' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不能少于 3 个长度');
//     await expect(v.validate({ a: '123' })).rejects.toThrow('a不能少于 6 个长度');
//     await expect(v.validate({ a: '123456' })).resolves.toBe(true);
//     await expect(v.validate({ a: '1234567890' })).rejects.toThrow('a不能超过 9 个长度');
//     await expect(v.validate({ a: '1234567890' }, { trigger: '' })).rejects.toThrow('a不能超过 9 个长度');

//     // 指定 trigger = x
//     await expect(v.validate({ a: '' }, { trigger: 'x' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' }, { trigger: 'x' })).rejects.toThrow('a不能少于 3 个长度');
//     await expect(v.validate({ a: '123' }, { trigger: 'x' })).resolves.toBe(true);
//     await expect(v.validate({ a: '123456' }, { trigger: 'x' })).resolves.toBe(true);
//     await expect(v.validate({ a: '1234567890' }, { trigger: 'x' })).rejects.toThrow('a不能超过 9 个长度');

//     // 指定 trigger = y
//     await expect(v.validate({ a: '' }, { trigger: 'y' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' }, { trigger: 'y' })).rejects.toThrow('a不能少于 6 个长度');
//     await expect(v.validate({ a: '123' }, { trigger: 'y' })).rejects.toThrow('a不能少于 6 个长度');
//     await expect(v.validate({ a: '123456' }, { trigger: 'y' })).resolves.toBe(true);
//     await expect(v.validate({ a: '1234567890' }, { trigger: 'y' })).rejects.toThrow('a不能超过 9 个长度');

//     // 指定 trigger = z
//     await expect(v.validate({ a: '' }, { trigger: 'z' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' }, { trigger: 'z' })).resolves.toBe(true);
//     await expect(v.validate({ a: '123' }, { trigger: 'z' })).resolves.toBe(true);
//     await expect(v.validate({ a: '123456' }, { trigger: 'z' })).resolves.toBe(true);
//     await expect(v.validate({ a: '1234567890' }, { trigger: 'z' })).resolves.toBe(true);
// });

// test('#validate 指定 fields', async () => {
//     const v = new Validation();

//     v.field('a').required();
//     v.field('b').required();
//     v.field('c').required();
//     v.field('d').required();

//     await expect(v.validate({ a: '1' }, { fields: ['a'] })).resolves.toBe(true);
//     await expect(v.validate({ a: '1' }, { fields: ['a', 'b'] })).rejects.toThrow('b不能为空');
// });

// test('.importSchema as type', async () => {
//     const v = importSchema({
//         a: [{ required: true, min: 3, max: 6, pattern: /^a/ }, { type: 'string' }]
//     });

//     await expect(v.validate({ a: '' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不能少于 3 个长度');
//     await expect(v.validate({ a: '1234567' })).rejects.toThrow('a不能超过 6 个长度');
//     await expect(v.validate({ a: '123' })).rejects.toThrow('a不合法');
//     await expect(v.validate({ a: 'a123' })).resolves.toBe(true);
// });

// test('.importSchema as format', async () => {
//     const v = importSchema({
//         a: {
//             type: 'url',
//             required: true
//         }
//     });

//     await expect(v.validate({ a: '123' })).rejects.toThrow('a必须是 URL 地址格式');
//     await expect(v.validate({ a: 'http://123.com' })).resolves.toBe(true);
// });

// test('.importSchema as enum', async () => {
//     const v = importSchema({
//         a: [{ required: true }, { type: 'enum', enum: ['b1', 'b2'], message: 'a 必须是 b1 或者 b2' }]
//     });

//     await expect(v.validate({ a: '' })).rejects.toThrow('a不能为空');
//     await expect(v.validate({ a: '123' })).rejects.toThrow('a 必须是 b1 或者 b2');
//     await expect(v.validate({ a: 'b1' })).resolves.toBe(true);
// });

// test('.importSchema as number', async () => {
//     const v = importSchema({
//         a: {
//             type: 'number',
//             min: 1,
//             max: 9
//         },
//         b: {
//             type: 'number',
//             len: 7,
//             message: 'b 必须等于 7'
//         }
//     });

//     await expect(v.validate({ a: 0 })).rejects.toThrow('a不能小于 1');
//     await expect(v.validate({ a: 10 })).rejects.toThrow('a不能大于 9');
//     await expect(v.validate({ a: 7, b: 1 })).rejects.toThrow('b 必须等于 7');
//     await expect(v.validate({ a: 7, b: 7 })).resolves.toBe(true);
// });

// test('.importSchema as length', async () => {
//     const v = importSchema({
//         a: {
//             type: 'string',
//             len: 3
//         }
//     });

//     await expect(v.validate({ a: '1' })).rejects.toThrow('a必须是 3 个长度');
// });

// test('.importSchema as pattern', async () => {
//     const v = importSchema({
//         a: {
//             type: 'string',
//             pattern: /^a/
//         },
//         b: {
//             type: 'string',
//             pattern: 'bb'
//         }
//     });

//     await expect(v.validate({ a: '1' })).rejects.toThrow('a不合法');
//     await expect(v.validate({ a: 'a1', b: 'b2' })).rejects.toThrow('b不合法');
//     await expect(v.validate({ a: 'a1', b: 'b2bbb2' })).resolves.toBe(true);
// });

// test('.importSchema as validator', async () => {
//     const v = importSchema({
//         b: {
//             type: 'string',
//             required: true,
//             validator: (rule, value, callback, source, options) => {
//                 if (value === source.a) return callback();

//                 throw new Error('b 错了');
//             }
//         }
//     });

//     await expect(v.validate({ a: 'a123', b: '' })).rejects.toThrow('b不能为空');
//     await expect(v.validate({ a: 'a123', b: 'a' })).rejects.toThrow('b 错了');
//     await expect(v.validate({ a: 'a123', b: 'a123' })).resolves.toBe(true);
// });

// test('.importSchema 不支持情况', () => {
//     expect(() =>
//         importSchema({
//             a: {
//                 whitespace: true
//             }
//         })
//     ).toThrow('不支持');
// });

// test('.importSchema 标准情况', () => {
//     const v1 = new Validation();

//     v1.field('a').required();
//     const v2 = importSchema(v1.exportSchema());

//     expect(v1.exportSchema()).toBe(v2.exportSchema());
//     expect(v1.exportDesc('a')).toBe(v2.exportDesc('a'));
//     expect(v1.exportDesc('a').rules.length).toBe(v2.exportDesc('a').rules.length);
//     expect(v1.exportDesc('a').rules[0].type).toBe(v2.exportDesc('a').rules[0].type);
// });

// test('.importSchema 混合情况', () => {
//     const schema = {
//         a: va.required(),
//         b: va.required().rules,
//         c: [{ required: true }]
//     };
//     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
//     // @ts-ignore
//     const v2 = importSchema(schema);
//     // console.log(v2.getSchema());
//     expect(v2.exportDesc('a').rules).toHaveLength(1);
//     expect(v2.exportDesc('a').rules[0].type).toBe('required');
//     expect(v2.exportDesc('b').rules).toHaveLength(1);
//     expect(v2.exportDesc('b').rules[0].type).toBe('required');
//     expect(v2.exportDesc('c').rules).toHaveLength(1);
//     expect(v2.exportDesc('c').rules[0].type).toBe('required');
// });

// test('.importRules 兼容情况：对象', () => {
//     const v = importRules('a', { required: true });
//     const schema = v.exportSchema();
//     expect(schema.a.usable(1, schema.a.rules[0], schema)).toBe(true);
//     expect(schema.a.rules).toHaveLength(1);
//     expect(schema.a.rules[0].type).toBe('required');
//     expect(schema.a.rules[0].triggers).toEqual([]);
// });

// test('.importRules 兼容情况：trigger', () => {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
//     // @ts-ignore
//     const v = importRules('a', { required: true, trigger: 'change' });
//     const desc = v.exportDesc('a');
//     expect(desc.rules).toHaveLength(1);
//     expect(desc.rules[0].type).toBe('required');
//     expect(desc.rules[0].triggers).toEqual(['change']);
// });

// test('.importRules 兼容情况：数组', () => {
//     const v = importRules('a', [{ required: true }]);
//     const schema = v.exportSchema();
//     expect(schema.a.rules).toHaveLength(1);
//     expect(schema.a.rules[0].type).toBe('required');
// });

// test('.importRules 标准情况：数组', () => {
//     const v1 = new Validation();
//     v1.field('a').required();
//     const v2 = importRules('b', v1.exportDesc('a').rules);
//     const schema = v2.exportSchema();
//     expect(schema.b.rules).toHaveLength(1);
// });

// test('.importRules 标准情况：实例', () => {
//     const v1 = new Validation();
//     v1.field('a').required();
//     const v2 = importRules('b', va.required());
//     const schema = v2.exportSchema();
//     expect(schema.b.usable(1, schema.b.rules[0], schema)).toBe(true);
//     expect(schema.b.rules).toHaveLength(1);
// });

// test('#destroy', () => {
//     const v = new Validation();

//     v.destroy();
//     expect(v.exportSchema()).toBe(null);
// });

// test('添加验证规则：必须先指定验证字段', () => {
//     const v = new Validation();

//     expect(() => {
//         v.type('string');
//     }).toThrow('必须先指定验证字段');
// });

// test('判断是否有验证规则：必须先指定验证字段', () => {
//     const v = new Validation();

//     expect(() => {
//         v.has('required');
//     }).toThrow('必须先指定验证字段');
// });

// test('设置规则是否可用：必须先指定验证规则', () => {
//     const v = new Validation();

//     expect(() => {
//         v.enable(false);
//     }).toThrow('必须先指定验证规则');
// });

// test('设置规则触发条件：必须先指定验证规则', () => {
//     const v = new Validation();

//     expect(() => {
//         v.field('a').trigger('a');
//     }).toThrow('必须先指定验证规则');
// });

// test('设置验证字段是否有效：必须先指定验证字段', () => {
//     const v = new Validation();

//     expect(() => {
//         v.usable(true);
//     }).toThrow('必须先指定验证字段');
// });

// test('静态规则', () => {
//     const rules = va.required().minLength(1).maxLength(3).rules;

//     // console.log(rules);
//     expect(rules).toHaveLength(3);
//     expect(rules[0].type).toBe('required');
//     expect(rules[1].type).toBe('minLength');
//     expect(rules[2].type).toBe('maxLength');

//     const v = importRules('a', rules);
//     const desc = v.exportDesc('a');
//     expect(desc.rules).toBe(rules);
//     // console.log(desc.rules);
//     expect(desc.rules).toHaveLength(3);
//     expect(desc.rules[0].type).toBe(rules[0].type);
//     expect(desc.rules[1].type).toBe(rules[1].type);
//     expect(desc.rules[2].type).toBe(rules[2].type);
// });
