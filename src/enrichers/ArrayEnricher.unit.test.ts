import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArrayEnricher } from './ArrayEnricher';
import type { RawVariable } from '../debugger/dapClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeVar(overrides: Partial<RawVariable>): RawVariable {
    return {
        name: 'testVar',
        value: '',
        variablesReference: 0,
        ...overrides,
    };
}

/** Creates a mock DebugSession where customRequest returns the given children. */
function makeSession(children: RawVariable[]) {
    return {
        customRequest: vi.fn().mockResolvedValue({ variables: children }),
    } as any;
}

// ─── canHandle ────────────────────────────────────────────────────────────────

describe('ArrayEnricher.canHandle', () => {
    const enricher = new ArrayEnricher();

    it('returns true when type is "Array"', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', variablesReference: 1, value: '[1, 2, 3]' }))).toBe(true);
    });

    it('returns true for value starting with "[" when no type', () => {
        expect(enricher.canHandle(makeVar({ value: '[1, 2, 3]', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for "Array(3)" style value', () => {
        expect(enricher.canHandle(makeVar({ value: 'Array(3)', variablesReference: 1 }))).toBe(true);
    });

    it('returns false when variablesReference is 0 (primitive)', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', value: '[1]', variablesReference: 0 }))).toBe(false);
    });

    it('returns false for plain objects', () => {
        expect(enricher.canHandle(makeVar({ type: 'Object', value: '{ a: 1 }', variablesReference: 1 }))).toBe(false);
    });

    it('does NOT claim objects that happen to contain "[" in their value string', () => {
        // e.g. { items: [1,2,3] } should not be claimed by ArrayEnricher
        expect(enricher.canHandle(makeVar({ type: 'Object', value: '{ items: [Array] }', variablesReference: 1 }))).toBe(false);
    });
});

// ─── enrich ───────────────────────────────────────────────────────────────────

describe('ArrayEnricher.enrich', () => {
    const enricher = new ArrayEnricher();

    it('returns an ArrayVariable with correct elements', async () => {
        const rawChildren: RawVariable[] = [
            makeVar({ name: '0', value: '10', variablesReference: 0 }),
            makeVar({ name: '1', value: '20', variablesReference: 0 }),
            makeVar({ name: '2', value: '30', variablesReference: 0 }),
            makeVar({ name: 'length', value: '3', variablesReference: 0 }),
        ];
        const session = makeSession(rawChildren);
        const variable = makeVar({ name: 'arr', type: 'Array', value: '[10, 20, 30]', variablesReference: 42 });

        const result = await enricher.enrich(variable, session);

        expect(result.kind).toBe('array');
        expect(result.name).toBe('arr');
        if (result.kind === 'array') {
            expect(result.elements).toEqual(['10', '20', '30']);
            expect(result.isArray).toBe(true);
        }
    });

    it('filters out non-numeric children like "length"', async () => {
        const rawChildren: RawVariable[] = [
            makeVar({ name: '0', value: 'hello', variablesReference: 0 }),
            makeVar({ name: 'length', value: '1', variablesReference: 0 }),
        ];
        const session = makeSession(rawChildren);
        const variable = makeVar({ name: 'words', type: 'Array', value: '["hello"]', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        if (result.kind === 'array') {
            expect(result.elements).toEqual(['hello']);
        }
    });

    it('returns empty elements array for an empty array', async () => {
        const session = makeSession([makeVar({ name: 'length', value: '0', variablesReference: 0 })]);
        const variable = makeVar({ name: 'empty', type: 'Array', value: '[]', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        if (result.kind === 'array') {
            expect(result.elements).toEqual([]);
        }
    });
});
