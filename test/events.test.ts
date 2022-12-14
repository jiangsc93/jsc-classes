import { AnyArray } from 'jsc-utils/type';
import Events from '../src/events';

test('#on(string)', () => {
    const e = new Events();
    const f = jest.fn();

    e.on('a', f);

    e.emit('a', 1, 2);
    expect(f.mock.calls).toHaveLength(1);
    expect(f).toBeCalledWith(1, 2);

    e.emit('a', 3, 4);
    expect(f.mock.calls).toHaveLength(2);
    expect(f).toBeCalledWith(3, 4);
});

test('#on(symbol)', () => {
    const e = new Events();
    const f = jest.fn();
    const a = Symbol();

    e.on(a, f);

    e.emit(a, 1, 2);
    expect(f.mock.calls).toHaveLength(1);
    expect(f).toBeCalledWith(1, 2);

    e.emit(a, 3, 4);
    expect(f.mock.calls).toHaveLength(2);
    expect(f).toBeCalledWith(3, 4);
});

test('#on(listener)', () => {
    const f = jest.fn();
    const e = new Events();

    e.on(f);
    e.emit('a', 1);
    e.emit('b', 2);

    expect(f.mock.calls).toHaveLength(2);
    expect(f.mock.calls[0]).toHaveLength(2);
    expect(f.mock.calls[1]).toHaveLength(2);
    expect(f.mock.calls[0][0]).toBe('a');
    expect(f.mock.calls[0][1]).toBe(1);
    expect(f.mock.calls[1][0]).toBe('b');
    expect(f.mock.calls[1][1]).toBe(2);
});

test('#on(): false', () => {
    const e = new Events();
    const f1 = jest.fn((...args: AnyArray) => false);
    const f2 = jest.fn();

    e.on('a', f1);
    e.on('a', f2);

    e.emit('a', 1);
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);
});

test('#once', () => {
    const e = new Events();
    const f = jest.fn();

    e.once('a', f);

    e.emit('a', 1, 2);
    expect(f.mock.calls).toHaveLength(1);
    expect(f).toBeCalledWith(1, 2);

    e.emit('a', 3, 4);
    expect(f.mock.calls).toHaveLength(1);
    expect(f).toBeCalledWith(1, 2);
});

test('#off()', () => {
    const e = new Events();
    const fa = jest.fn();
    const fb1 = jest.fn();
    const fb2 = jest.fn();
    const fc = jest.fn();

    e.on('a', fa);
    e.on('b', fb1);
    e.on('b', fb2);
    e.on('c', fc);

    e.emit('a', 1, 2);
    e.emit('b', 1, 2);
    e.emit('c', 1, 2);
    expect(fa.mock.calls).toHaveLength(1);
    expect(fa).toBeCalledWith(1, 2);
    expect(fb1.mock.calls).toHaveLength(1);
    expect(fb1).toBeCalledWith(1, 2);
    expect(fb2.mock.calls).toHaveLength(1);
    expect(fb2).toBeCalledWith(1, 2);
    expect(fc.mock.calls).toHaveLength(1);
    expect(fc).toBeCalledWith(1, 2);

    // ???????????????????????????
    e.off('a', fa);
    e.emit('a', 3, 4);
    e.emit('b', 3, 4);
    e.emit('c', 3, 4);
    expect(fa.mock.calls).toHaveLength(1);
    expect(fa).toBeCalledWith(1, 2);
    expect(fb1.mock.calls).toHaveLength(2);
    expect(fb1).toBeCalledWith(3, 4);
    expect(fb2.mock.calls).toHaveLength(2);
    expect(fb2).toBeCalledWith(3, 4);
    expect(fc.mock.calls).toHaveLength(2);
    expect(fc).toBeCalledWith(3, 4);

    // ??????????????????
    e.off('b');
    e.emit('a', 5, 6);
    e.emit('b', 5, 6);
    e.emit('c', 5, 6);
    expect(fa.mock.calls).toHaveLength(1);
    expect(fa).toBeCalledWith(1, 2);
    expect(fb1.mock.calls).toHaveLength(2);
    expect(fb1).toBeCalledWith(3, 4);
    expect(fb2.mock.calls).toHaveLength(2);
    expect(fb2).toBeCalledWith(3, 4);
    expect(fc.mock.calls).toHaveLength(3);
    expect(fc).toBeCalledWith(5, 6);

    // ??????????????????
    e.off();
    e.emit('a', 7, 8);
    e.emit('b', 7, 8);
    e.emit('c', 7, 8);
    expect(fa.mock.calls).toHaveLength(1);
    expect(fa).toBeCalledWith(1, 2);
    expect(fb1.mock.calls).toHaveLength(2);
    expect(fb1).toBeCalledWith(3, 4);
    expect(fb2.mock.calls).toHaveLength(2);
    expect(fb2).toBeCalledWith(3, 4);
    expect(fc.mock.calls).toHaveLength(3);
    expect(fc).toBeCalledWith(5, 6);
});

test('#off(): ???????????????????????????????????????', () => {
    const e = new Events();
    const f = jest.fn();

    // ?????????????????????????????????
    e.on('x', f);
    e.on('x', f);

    e.emit('x', 1);
    expect(f.mock.calls).toHaveLength(2);
    expect(f.mock.calls[0][0]).toBe(1);
    expect(f.mock.calls[1][0]).toBe(1);

    e.off('x', f);
    e.emit('x', 2);
    expect(f.mock.calls).toHaveLength(2);
});

test('#pipe(target, namespace)', () => {
    const e1 = new Events();
    const e2 = new Events();
    const f1 = jest.fn();
    const f2 = jest.fn();

    e1.pipe(e2, 'x');

    e1.on('a', f1);
    e2.on('x:a', f2);

    e1.emit('a', 1);
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f1).toBeCalledWith(1);
    expect(f2).toBeCalledWith(1);
});

test('????????????', () => {
    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();
    const e = new Events();
    const c1 = e.createChannel('x');
    const c2 = e.createChannel('y');
    c1.on('a', f1);
    c2.on('a', f2);
    c1.emit('a', 1);
    c2.emit('a', 2);
    e.on('a', f3);

    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f3.mock.calls).toHaveLength(0);
    expect(f1.mock.calls[0][0]).toBe(2);
    expect(f2.mock.calls[0][0]).toBe(1);
});

test('??????????????????????????????', () => {
    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();
    const e = new Events();
    const c1 = e.createChannel('1');
    const c2 = e.createChannel('2');
    const c3 = e.createChannel('3', { source: '2' });

    c1.on('a', f1);
    c2.on('a', f2);
    c3.on('a', f3);
    c1.emit('a', 1);
    c2.emit('a', 2);
    c3.emit('a', 3);

    // ?????????2???3
    expect(f1.mock.calls).toHaveLength(2);
    expect(f1.mock.calls[0]).toHaveLength(1);
    expect(f1.mock.calls[0][0]).toBe(2);
    expect(f1.mock.calls[1]).toHaveLength(1);
    expect(f1.mock.calls[1][0]).toBe(3);

    // ?????????1???3
    expect(f2.mock.calls).toHaveLength(2);
    expect(f2.mock.calls[0]).toHaveLength(1);
    expect(f2.mock.calls[0][0]).toBe(1);
    expect(f2.mock.calls[1]).toHaveLength(1);
    expect(f2.mock.calls[1][0]).toBe(3);

    // ?????????2
    expect(f3.mock.calls).toHaveLength(1);
    expect(f3.mock.calls[0]).toHaveLength(1);
    expect(f3.mock.calls[0][0]).toBe(2);
});

test('??????????????????????????????', () => {
    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();
    const e = new Events();
    const c1 = e.createChannel('1');
    const c2 = e.createChannel('2');
    const c3 = e.createChannel('3', { target: '2' });

    c1.on('a', f1);
    c2.on('a', f2);
    c3.on('a', f3);
    c1.emit('a', 1);
    c2.emit('a', 2);
    c3.emit('a', 3);

    // ?????????2
    expect(f1.mock.calls).toHaveLength(1);
    expect(f1.mock.calls[0]).toHaveLength(1);
    expect(f1.mock.calls[0][0]).toBe(2);

    // ?????????1???3
    expect(f2.mock.calls).toHaveLength(2);
    expect(f2.mock.calls[0]).toHaveLength(1);
    expect(f2.mock.calls[0][0]).toBe(1);
    expect(f2.mock.calls[1]).toHaveLength(1);
    expect(f2.mock.calls[1][0]).toBe(3);

    // ?????????1???2
    expect(f3.mock.calls).toHaveLength(2);
    expect(f3.mock.calls[0]).toHaveLength(1);
    expect(f3.mock.calls[0][0]).toBe(1);
    expect(f3.mock.calls[1]).toHaveLength(1);
    expect(f3.mock.calls[1][0]).toBe(2);
});

test('??????????????????????????????????????????', () => {
    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();
    const e = new Events();
    const c1 = e.createChannel('1');
    const c2 = e.createChannel('2');
    const c3 = e.createChannel('3', { source: '2', target: '2' });

    c1.on('a', f1);
    c2.on('a', f2);
    c3.on('a', f3);
    c1.emit('a', 1);
    c2.emit('a', 2);
    c3.emit('a', 3);

    // ?????????2
    expect(f1.mock.calls).toHaveLength(1);
    expect(f1.mock.calls[0]).toHaveLength(1);
    expect(f1.mock.calls[0][0]).toBe(2);

    // ?????????1???3
    expect(f2.mock.calls).toHaveLength(2);
    expect(f2.mock.calls[0]).toHaveLength(1);
    expect(f2.mock.calls[0][0]).toBe(1);
    expect(f2.mock.calls[1]).toHaveLength(1);
    expect(f2.mock.calls[1][0]).toBe(3);

    // ?????????2
    expect(f3.mock.calls).toHaveLength(1);
    expect(f3.mock.calls[0]).toHaveLength(1);
    expect(f3.mock.calls[0][0]).toBe(2);
});

test('???????????????????????????????????????????????????', () => {
    const e = new Events();
    const ca = e.createChannel('a', { target: 'b' });
    const cb = e.createChannel('b', { source: 'c' });

    const fa = jest.fn();
    const fb = jest.fn();

    ca.on('x', fa);
    cb.on('x', fb);

    ca.emit('x');
    expect(fa.mock.calls).toHaveLength(0);
    expect(fb.mock.calls).toHaveLength(0);

    cb.emit('x');
    expect(fa.mock.calls).toHaveLength(1);
    expect(fb.mock.calls).toHaveLength(0);
});

test('???????????????????????????????????????????????????', () => {
    const e = new Events({ targetFirst: true });
    const ca = e.createChannel('a', { target: 'b' });
    const cb = e.createChannel('b', { source: 'c' });

    const fa = jest.fn();
    const fb = jest.fn();

    ca.on('x', fa);
    cb.on('x', fb);

    ca.emit('x');
    expect(fa.mock.calls).toHaveLength(0);
    expect(fb.mock.calls).toHaveLength(1);

    cb.emit('x');
    expect(fa.mock.calls).toHaveLength(1);
    expect(fb.mock.calls).toHaveLength(1);
});

test('?????????????????????', () => {
    const e1 = new Events();
    const c2 = e1.createChannel('a');
    const c3 = e1.createChannel('b');

    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();

    e1.on('x', f1);
    c2.on('x', f2);
    c3.on('x', f3);

    e1.emit('x');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(0);

    c2.emit('x');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(1);

    c3.emit('x');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f3.mock.calls).toHaveLength(1);
});

test('??????????????????/?????????', () => {
    const e1 = new Events();
    const c2 = e1.createChannel('a', { extend: true });
    const c3 = e1.createChannel('b', { inherit: true });

    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();

    e1.on('x', f1);
    c2.on('x', f2);
    c3.on('x', f3);

    e1.emit('x');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(1);

    c2.emit('x');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(2);

    c3.emit('x');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f3.mock.calls).toHaveLength(2);
});

test('??????????????????/????????? + ??????/??????', () => {
    const e1 = new Events();
    const c2 = e1.createChannel('a', { extend: true });
    const c3 = e1.createChannel('b', { inherit: true });
    const c4 = e1.createChannel('c', { source: 'a', target: 'b' });

    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();
    const f4 = jest.fn();

    e1.on('x', f1);
    c2.on('x', f2);
    c3.on('x', f3);
    c4.on('x', f4);

    e1.emit('x');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(1);
    expect(f4.mock.calls).toHaveLength(0);

    c2.emit('x');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(0);
    expect(f3.mock.calls).toHaveLength(2);
    expect(f4.mock.calls).toHaveLength(1);

    c3.emit('x');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f3.mock.calls).toHaveLength(2);
    expect(f4.mock.calls).toHaveLength(1);

    c4.emit('x');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(1);
    expect(f3.mock.calls).toHaveLength(3);
    expect(f4.mock.calls).toHaveLength(1);
});

test('#destroy', () => {
    const e = new Events();

    expect(e.destroy()).toBe(undefined);
});

test('?????????on ???????????? on', () => {
    const e = new Events();
    const f2 = jest.fn();
    const f1 = jest.fn(() => {
        e.on('a', f2);
    });

    e.on('a', f1);

    e.emit('a');
    expect(f1.mock.calls).toHaveLength(1);
    expect(f2.mock.calls).toHaveLength(0);

    e.emit('a');
    expect(f1.mock.calls).toHaveLength(2);
    expect(f2.mock.calls).toHaveLength(1);
});

test('??????????????????????????????????????????', () => {
    const e = new Events({ maxLength: 2 });
    const f1 = jest.fn();
    const f2 = jest.fn();
    const f3 = jest.fn();

    e.on('a', f1);
    e.on('a', f2);

    expect(() => {
        e.on('a', f3);
    }).toThrow('???????????????????????????????????????????????? 2 ???');
});

test('????????????????????????????????????????????????', () => {
    const e = new Events();
    const c = e.createChannel(1);
    expect(() => c.createChannel(2)).toThrow('???????????????????????????????????????');
});

test('????????????????????? id ????????????????????? id ??????', () => {
    const e = new Events();
    expect(() => e.createChannel('x', { source: 'x' })).toThrow('???????????? id ????????????????????? id ??????');
});

test('????????????????????? id ????????????????????? id ??????', () => {
    const e = new Events();
    expect(() => e.createChannel('x', { target: 'x' })).toThrow('???????????? id ????????????????????? id ??????');
});
