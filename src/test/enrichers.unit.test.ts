import { describe, expect, it, vi } from 'vitest';
import { ArrayEnricher } from '../enrichers/ArrayEnricher';
import { LinkedListEnricher } from '../enrichers/LinkedListEnricher';
import { ObjectEnricher } from '../enrichers/ObjectEnricher';
import type { RawVariable } from '../debugger/dapClient';

vi.mock('../debugger/dapClient', async () => {
    const actual = await vi.importActual('../debugger/dapClient');
    return {
        ...actual,
        fetchChildren: vi.fn(),
    };
});

import { fetchChildren } from '../debugger/dapClient';

const fetchChildrenMock = vi.mocked(fetchChildren);

describe('enrichers', () => {
    it('enriches one-dimensional arrays', async () => {
        const enricher = new ArrayEnricher();
        fetchChildrenMock.mockResolvedValueOnce([
            { name: '0', value: '10', variablesReference: 0 },
            { name: '1', value: '20', variablesReference: 0 },
        ] as RawVariable[]);

        const result = await enricher.enrich(
            { name: 'arr', value: 'Array(2)', variablesReference: 100 } as RawVariable,
            {} as never
        );

        expect(result).toEqual({
            kind: 'array',
            name: 'arr',
            isArray: true,
            elements: ['10', '20'],
        });
    });

    it('enriches linked lists by following next pointers', async () => {
        const enricher = new LinkedListEnricher();
        fetchChildrenMock
            // 1st call: enrich() fetches initialChildren (ref 200) — no 'head' found, used directly
            .mockResolvedValueOnce([
                { name: 'value', value: '1', variablesReference: 0 },
                { name: 'next', value: 'Node', variablesReference: 201 },
            ] as RawVariable[])
            // 2nd call: traverse() recurses to ref 201
            .mockResolvedValueOnce([
                { name: 'value', value: '2', variablesReference: 0 },
                { name: 'next', value: 'null', variablesReference: 0 },
            ] as RawVariable[]);

        const result = await enricher.enrich(
            { name: 'head', value: 'Node { next: ... }', variablesReference: 200 } as RawVariable,
            {} as never
        );

        expect(result).toEqual({
            kind: 'linkedList',
            name: 'head',
            nodes: ['1', '2'],
        });
    });

    it('filters internal object members', async () => {
        const enricher = new ObjectEnricher();
        fetchChildrenMock.mockResolvedValueOnce([
            { name: 'x', value: '1', variablesReference: 0 },
            { name: '__proto__', value: 'Object', variablesReference: 1, presentationHint: { visibility: 'internal' } },
        ] as RawVariable[]);

        const result = await enricher.enrich(
            { name: 'obj', value: 'Object', type: 'Object', variablesReference: 300 } as RawVariable,
            {} as never
        );

        expect(result).toEqual({
            kind: 'object',
            name: 'obj',
            isObject: true,
            entries: [{ key: 'x', value: '1' }],
        });
    });
});
