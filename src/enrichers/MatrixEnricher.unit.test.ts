import { describe, it, expect, vi } from 'vitest';
import { MatrixEnricher } from './MatrixEnricher';
import type { RawVariable } from '../debugger/dapClient';

function makeVar(overrides: Partial<RawVariable>): RawVariable {
    return { name: 'testVar', value: '', variablesReference: 0, ...overrides };
}

function makeSession(childrenMap: Record<number, RawVariable[]>) {
    return {
        customRequest: vi.fn().mockImplementation((_req: string, args: { variablesReference: number }) => {
            return Promise.resolve({ variables: childrenMap[args.variablesReference] ?? [] });
        }),
    } as any;
}

// ─── canHandle ────────────────────────────────────────────────────────────────

describe('MatrixEnricher.canHandle', () => {
    const enricher = new MatrixEnricher();

    it('returns true for nested-array value with [Array] placeholder', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', value: '[ [Array], [Array] ]', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for value matching [[', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', value: '[ [ 1, 2 ], [ 3, 4 ] ]', variablesReference: 1 }))).toBe(true);
    });

    it('returns false for a 1D flat array', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', value: '[ 1, 2, 3 ]', variablesReference: 1 }))).toBe(false);
    });

    it('returns false when variablesReference is 0', () => {
        expect(enricher.canHandle(makeVar({ type: 'Array', value: '[ [Array] ]', variablesReference: 0 }))).toBe(false);
    });

    it('returns false for plain objects', () => {
        expect(enricher.canHandle(makeVar({ type: 'Object', value: '{ a: 1 }', variablesReference: 1 }))).toBe(false);
    });
});

// ─── enrich ───────────────────────────────────────────────────────────────────

describe('MatrixEnricher.enrich', () => {
    const enricher = new MatrixEnricher();

    it('returns Array2DVariable with correct rows', async () => {
        // variablesReference 10 → top-level matrix → rows at refs 20, 30
        const childrenMap: Record<number, RawVariable[]> = {
            10: [
                makeVar({ name: '0', value: '[Array]', variablesReference: 20 }),
                makeVar({ name: '1', value: '[Array]', variablesReference: 30 }),
                makeVar({ name: 'length', value: '2', variablesReference: 0 }),
            ],
            20: [
                makeVar({ name: '0', value: '1', variablesReference: 0 }),
                makeVar({ name: '1', value: '2', variablesReference: 0 }),
            ],
            30: [
                makeVar({ name: '0', value: '3', variablesReference: 0 }),
                makeVar({ name: '1', value: '4', variablesReference: 0 }),
            ],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'matrix', type: 'Array', value: '[ [Array], [Array] ]', variablesReference: 10 });

        const result = await enricher.enrich(variable, session);

        expect(result.kind).toBe('array2d');
        expect(result.name).toBe('matrix');
        expect(result.rows).toEqual([['1', '2'], ['3', '4']]);
    });
});
