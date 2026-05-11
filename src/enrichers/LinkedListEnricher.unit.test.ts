import { describe, it, expect, vi } from 'vitest';
import { LinkedListEnricher } from './LinkedListEnricher';
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

describe('LinkedListEnricher.canHandle', () => {
    const enricher = new LinkedListEnricher();

    it('returns true for a node with "next" in its value', () => {
        expect(enricher.canHandle(makeVar({ value: 'ListNode { value: 1, next: null }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for a wrapper class with "head" in its value', () => {
        expect(enricher.canHandle(makeVar({ value: 'LinkedList { head: [Object] }', variablesReference: 1 }))).toBe(true);
    });

    it('returns false when variablesReference is 0', () => {
        expect(enricher.canHandle(makeVar({ value: 'ListNode { next: null }', variablesReference: 0 }))).toBe(false);
    });

    it('returns false for a plain object without next/head', () => {
        expect(enricher.canHandle(makeVar({ value: 'Object { a: 1, b: 2 }', variablesReference: 1 }))).toBe(false);
    });
});

// ─── enrich ───────────────────────────────────────────────────────────────────

describe('LinkedListEnricher.enrich', () => {
    const enricher = new LinkedListEnricher();

    it('returns empty nodes for a null-head list', async () => {
        const childrenMap: Record<number, RawVariable[]> = {
            1: [makeVar({ name: 'head', value: 'null', variablesReference: 0 })],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'list', value: 'LinkedList { head: null }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.kind).toBe('linkedList');
        expect(result.nodes).toEqual([]);
    });

    it('traverses a multi-node list correctly', async () => {
        // List: 1 -> 2 -> 3 -> null
        const childrenMap: Record<number, RawVariable[]> = {
            10: [
                makeVar({ name: 'value', value: '1', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'ListNode {}', variablesReference: 20 }),
            ],
            20: [
                makeVar({ name: 'value', value: '2', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'ListNode {}', variablesReference: 30 }),
            ],
            30: [
                makeVar({ name: 'value', value: '3', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'null', variablesReference: 0 }),
            ],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'list', value: 'ListNode { value: 1, next: [Object] }', variablesReference: 10 });

        const result = await enricher.enrich(variable, session);
        expect(result.nodes).toEqual(['1', '2', '3']);
    });

    it('handles wrapper class with head property', async () => {
        const childrenMap: Record<number, RawVariable[]> = {
            1: [makeVar({ name: 'head', value: 'ListNode {}', variablesReference: 10 })],
            10: [
                makeVar({ name: 'value', value: '42', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'null', variablesReference: 0 }),
            ],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'myList', value: 'LinkedList { head: [Object] }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.nodes).toEqual(['42']);
    });
});
