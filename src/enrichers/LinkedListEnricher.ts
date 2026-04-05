import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, LinkedListVariable } from './types';

export interface LinkedListNode {
    value: string;
    next: LinkedListNode | null;
}


export class LinkedListEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        return (
            variable.variablesReference > 0 &&
            /^\w+ \{.*next:/.test(variable.value)
        );
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<LinkedListVariable> {
        const nodes: string[] = [];
        await this.traverse(variable.variablesReference, session, nodes, 0);

        return {
            kind: 'linkedList',
            name: variable.name,
            nodes,
        };
    }

    private async traverse(
        variablesReference: number,
        session: vscode.DebugSession,
        nodes: string[],
        depth: number
    ): Promise<void> {
        if (depth > 100) {return;}

        const children = await fetchChildren(session, variablesReference);
        const valueChild = children.find((c) => c.name === 'value' || c.name === 'val');
        const nextChild = children.find((c) => c.name === 'next');

        if (!valueChild) {return;}
        nodes.push(valueChild.value);

        if (nextChild && nextChild.variablesReference > 0 && nextChild.value !== 'null') {
            await this.traverse(nextChild.variablesReference, session, nodes, depth + 1);
        }
    }
}
