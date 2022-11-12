import Fault from '../src/fault';

test('new()', () => {
    const f = new Fault();

    expect(f.constructor).toBe(Fault);
    expect(f instanceof Error).toBe(true);
    expect(typeof f.id).toBe('number');
    expect(f.name).toBe('Fault');
    expect(f.type).toBe('Fault');
    expect(f.toString()).toEqual('');
});

test('new(message)', () => {
    const f = new Fault('abc');

    expect(f.message).toBe('abc');
    expect(f.toString()).toBe('abc');
    expect(f + '').toBe('abc');
});

test('new(metas)', () => {
    const f = Fault.create({ x: 1, y: 2 });

    expect(f.x).toBe(1);
    expect(f.y).toBe(2);
});
