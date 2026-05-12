import { describe, it, expect, vi } from 'vitest';
import { ObjectEnricher } from './ObjectEnricher';
import { PrimitiveEnricher } from './PrimitiveEnricher';
import type { RawVariable } from '../debugger/dapClient';

function makeVar(overrides: Partial<RawVariable>): RawVariable {
    return { name: 'testVar', value: '', variablesReference: 0, ...overrides };
}

function makeSession(children: RawVariable[]) {
    return {
        customRequest: vi.fn().mockResolvedValue({ variables: children }),
    } as any;
}

// ─── ObjectEnricher ───────────────────────────────────────────────────────────

describe('ObjectEnricher.canHandle', () => {
    const enricher = new ObjectEnricher();

    it('returns true when type is "Object" and ref > 0', () => {
        expect(enricher.canHandle(makeVar({ type: 'Object', variablesReference: 1, value: '{ a: 1 }' }))).toBe(true);
    });

    it('returns false when variablesReference is 0', () => {
        expect(enricher.canHandle(makeVar({ type: 'Object', variablesReference: 0, value: '{}' }))).toBe(false);
    });

    it('returns false when type is not Object', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', variablesReference: 1, value: '[1,2]' }))).toBe(false);
    });
});

describe('ObjectEnricher.enrich', () => {
    const enricher = new ObjectEnricher();

    it('returns ObjectVariable with correct entries', async () => {
        const rawChildren: RawVariable[] = [
            makeVar({ name: 'x', value: '10', variablesReference: 0 }),
            makeVar({ name: 'y', value: '20', variablesReference: 0 }),
        ];
        const session = makeSession(rawChildren);
        const variable = makeVar({ name: 'point', type: 'Object', value: '{ x: 10, y: 20 }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.kind).toBe('object');
        expect(result.entries).toEqual([
            { key: 'x', value: '10' },
            { key: 'y', value: '20' },
        ]);
    });

    it('filters out internal visibility properties', async () => {
        const rawChildren: RawVariable[] = [
            makeVar({ name: 'publicProp', value: 'hello', variablesReference: 0 }),
            { name: '__proto__', value: '{}', variablesReference: 0, presentationHint: { visibility: 'internal' } },
        ];
        const session = makeSession(rawChildren);
        const variable = makeVar({ name: 'obj', type: 'Object', value: '{ publicProp: "hello" }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].key).toBe('publicProp');
    });
});

// ─── PrimitiveEnricher ────────────────────────────────────────────────────────

describe('PrimitiveEnricher', () => {
    const enricher = new PrimitiveEnricher();

    it('canHandle always returns true (catch-all)', () => {
        expect(enricher.canHandle(makeVar({ value: '42' }))).toBe(true);
        expect(enricher.canHandle(makeVar({ value: 'hello', type: 'string' }))).toBe(true);
        expect(enricher.canHandle(makeVar({ value: 'true', type: 'boolean' }))).toBe(true);
    });

    it('returns PrimitiveVariable with correct name and value', async () => {
        const session = {} as any;
        const variable = makeVar({ name: 'count', value: '99', variablesReference: 0 });

        const result = await enricher.enrich(variable, session);
        expect(result.kind).toBe('primitive');
        expect(result.name).toBe('count');
        if (result.kind === 'primitive') {
            expect(result.value).toBe('99');
        }
    });
});
