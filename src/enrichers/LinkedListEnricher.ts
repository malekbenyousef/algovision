import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, LinkedListVariable } from './types';

export interface LinkedListNode {
    value: string;
    next: LinkedListNode | null;
}

export class LinkedListEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        if (variable.variablesReference === 0) { return false; }
        // Match Node.js DAP value formats:
        //   "ListNode { value: 1, next: null }"
        //   "LinkedList { head: [Object] }"
        //   "Node { val: 5, next: [Object] }"
        return /\{[^}]*(next|head)\s*:/.test(variable.value);
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<LinkedListVariable> {
        const nodes: string[] = [];
        let startReference = variable.variablesReference;

        // Fetch top-level properties to check if this is a wrapper class (has 'head')
        const initialChildren = await fetchChildren(session, startReference);
        const headChild = initialChildren.find(c => c.name === 'head');

        if (headChild) {
            // Wrapper class (e.g. LinkedList { head: ... })
            if (headChild.value === 'null' || headChild.variablesReference === 0) {
                return { kind: 'linkedList', name: variable.name, nodes: [] };
            }
            startReference = headChild.variablesReference;
            // Start traversal directly — no need to re-fetch these children
            await this.traverseFromRef(startReference, session, nodes, 0);
        } else {
            // Direct node (e.g. ListNode { value: 1, next: ... })
            // initialChildren already has the children — extract directly
            await this.traverseFromChildren(initialChildren, session, nodes, 0);
        }

        return { kind: 'linkedList', name: variable.name, nodes };
    }

    /** Traversal starting from a variablesReference (fetches children itself). */
    private async traverseFromRef(
        variablesReference: number,
        session: vscode.DebugSession,
        nodes: string[],
        depth: number
    ): Promise<void> {
        if (depth > 100 || variablesReference === 0) { return; }
        const children = await fetchChildren(session, variablesReference);
        await this.traverseFromChildren(children, session, nodes, depth);
    }

    /** Traversal given already-fetched children array. */
    private async traverseFromChildren(
        children: RawVariable[],
        session: vscode.DebugSession,
        nodes: string[],
        depth: number
    ): Promise<void> {
        if (depth > 100) { return; }

        const valueChild = children.find(c => c.name === 'value' || c.name === 'val');
        const nextChild  = children.find(c => c.name === 'next');

        if (!valueChild) { return; }

        // Strip surrounding quotes Node.js sometimes adds (e.g. '"hello"' → 'hello')
        const rawValue = valueChild.value.replace(/^["']|["']$/g, '');
        nodes.push(rawValue);

        if (nextChild && nextChild.variablesReference > 0 && nextChild.value !== 'null') {
            await this.traverseFromRef(nextChild.variablesReference, session, nodes, depth + 1);
        }
    }
}
