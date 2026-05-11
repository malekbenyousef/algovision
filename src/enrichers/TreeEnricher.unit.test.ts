import { describe, it, expect, vi } from 'vitest';
import { TreeEnricher } from './TreeEnricher';
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

describe('TreeEnricher.canHandle', () => {
    const enricher = new TreeEnricher();

    it('returns true for TreeNode value pattern', () => {
        expect(enricher.canHandle(makeVar({ value: 'TreeNode { value: 1, left: null, right: null }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for variables named "root"', () => {
        expect(enricher.canHandle(makeVar({ name: 'root', value: 'BSTNode { val: 5 }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for variables named "tree"', () => {
        expect(enricher.canHandle(makeVar({ name: 'tree', value: 'BST { root: [Object] }', variablesReference: 1 }))).toBe(true);
    });

    it('returns true when type contains "TreeNode"', () => {
        expect(enricher.canHandle(makeVar({ type: 'TreeNode', value: 'TreeNode {}', variablesReference: 1 }))).toBe(true);
    });

    it('returns true for value pattern with left/right', () => {
        expect(enricher.canHandle(makeVar({ value: 'BSTNode { left: null, right: null }', variablesReference: 1 }))).toBe(true);
    });

    it('returns false when variablesReference is 0', () => {
        expect(enricher.canHandle(makeVar({ name: 'root', value: 'null', variablesReference: 0 }))).toBe(false);
    });

    it('returns false for plain number primitive', () => {
        expect(enricher.canHandle(makeVar({ name: 'count', value: '42', variablesReference: 0 }))).toBe(false);
    });
});

// ─── enrich ───────────────────────────────────────────────────────────────────

describe('TreeEnricher.enrich', () => {
    const enricher = new TreeEnricher();

    it('returns tree with null root when root child is null', async () => {
        const childrenMap: Record<number, RawVariable[]> = {
            1: [makeVar({ name: 'root', value: 'null', variablesReference: 0 })],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'tree', value: 'BST { root: null }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.kind).toBe('tree');
        if (result.kind === 'tree') {
            expect(result.root).toBeNull();
        }
    });

    it('returns a tree with correct root value', async () => {
        // Tree: root(10) -> left(5) -> right(20)
        const childrenMap: Record<number, RawVariable[]> = {
            1: [makeVar({ name: 'root', value: 'TreeNode {}', variablesReference: 2 })],
            2: [
                makeVar({ name: 'value', value: '10', variablesReference: 0 }),
                makeVar({ name: 'left', value: 'TreeNode {}', variablesReference: 3 }),
                makeVar({ name: 'right', value: 'TreeNode {}', variablesReference: 4 }),
            ],
            3: [
                makeVar({ name: 'value', value: '5', variablesReference: 0 }),
                makeVar({ name: 'left', value: 'null', variablesReference: 0 }),
                makeVar({ name: 'right', value: 'null', variablesReference: 0 }),
            ],
            4: [
                makeVar({ name: 'value', value: '20', variablesReference: 0 }),
                makeVar({ name: 'left', value: 'null', variablesReference: 0 }),
                makeVar({ name: 'right', value: 'null', variablesReference: 0 }),
            ],
        };
        const session = makeSession(childrenMap);
        const variable = makeVar({ name: 'tree', value: 'BST { root: [Object] }', variablesReference: 1 });

        const result = await enricher.enrich(variable, session);
        expect(result.kind).toBe('tree');
        if (result.kind === 'tree') {
            expect(result.root?.value).toBe('10');
            expect(result.root?.left?.value).toBe('5');
            expect(result.root?.right?.value).toBe('20');
        }
    });
});
