import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkedListEnricher } from './LinkedListEnricher';
import type { RawVariable } from '../debugger/dapClient';

vi.mock('../debugger/dapClient', async () => {
    const actual = await vi.importActual('../debugger/dapClient');
    return { ...actual, fetchChildren: vi.fn() };
});

import { fetchChildren } from '../debugger/dapClient';
const fetchMock = vi.mocked(fetchChildren);

function makeVar(overrides: Partial<RawVariable>): RawVariable {
    return { name: 'testVar', value: '', variablesReference: 0, ...overrides };
}

// ─── canHandle ────────────────────────────────────────────────────────────────

describe('LinkedListEnricher.canHandle', () => {
    const enricher = new LinkedListEnricher();

    it('returns true for a direct node with "next"', () => {
        expect(enricher.canHandle(makeVar({ value: 'ListNode { value: 1, next: null }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for a wrapper class with "head"', () => {
        expect(enricher.canHandle(makeVar({ value: 'LinkedList { head: [Object] }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for "val" + "next" style node', () => {
        expect(enricher.canHandle(makeVar({ value: 'Node { val: 5, next: null }', variablesReference: 1 }))).toBe(true);
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

    beforeEach(() => { fetchMock.mockReset(); });

    it('returns empty nodes for a null-head wrapper', async () => {
        // enrich() fetches ref 1 → finds head=null → returns empty
        fetchMock.mockResolvedValueOnce([
            makeVar({ name: 'head', value: 'null', variablesReference: 0 }),
        ]);
        const variable = makeVar({ name: 'list', value: 'LinkedList { head: null }', variablesReference: 1 });

        const result = await enricher.enrich(variable, {} as any);
        expect(result.kind).toBe('linkedList');
        expect(result.nodes).toEqual([]);
    });

    it('traverses a direct-node list: 1 → 2 → 3', async () => {
        // enrich() fetches ref 10 → no head child → uses traverseFromChildren
        // Then traverses next refs 20, 30
        fetchMock
            .mockResolvedValueOnce([ // ref 10 (initial fetch)
                makeVar({ name: 'value', value: '1', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'ListNode {}', variablesReference: 20 }),
            ])
            .mockResolvedValueOnce([ // ref 20
                makeVar({ name: 'value', value: '2', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'ListNode {}', variablesReference: 30 }),
            ])
            .mockResolvedValueOnce([ // ref 30
                makeVar({ name: 'value', value: '3', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'null', variablesReference: 0 }),
            ]);

        const variable = makeVar({ name: 'head', value: 'ListNode { value: 1, next: [Object] }', variablesReference: 10 });
        const result = await enricher.enrich(variable, {} as any);
        expect(result.nodes).toEqual(['1', '2', '3']);
    });

    it('handles wrapper class with head property', async () => {
        fetchMock
            .mockResolvedValueOnce([ // ref 1: wrapper fetch
                makeVar({ name: 'head', value: 'ListNode {}', variablesReference: 10 }),
            ])
            .mockResolvedValueOnce([ // ref 10: first node
                makeVar({ name: 'value', value: '42', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'null', variablesReference: 0 }),
            ]);

        const variable = makeVar({ name: 'myList', value: 'LinkedList { head: [Object] }', variablesReference: 1 });
        const result = await enricher.enrich(variable, {} as any);
        expect(result.nodes).toEqual(['42']);
    });

    it('strips quotes from string values', async () => {
        fetchMock
            .mockResolvedValueOnce([
                makeVar({ name: 'value', value: '"hello"', variablesReference: 0 }),
                makeVar({ name: 'next', value: 'null', variablesReference: 0 }),
            ]);

        const variable = makeVar({ name: 'node', value: 'ListNode { value: "hello", next: null }', variablesReference: 1 });
        const result = await enricher.enrich(variable, {} as any);
        expect(result.nodes).toEqual(['hello']);
    });
});
