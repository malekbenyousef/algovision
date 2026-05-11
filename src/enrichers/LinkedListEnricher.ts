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
        // Updated regex to look for either 'next' or 'head'
        /^\w+ \{.*(next|head):/.test(variable.value)
    );
}

async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<LinkedListVariable> {
    const nodes: string[] = [];
    let startReference = variable.variablesReference;

    // Fetch the top-level properties of the variable
    const initialChildren = await fetchChildren(session, startReference);
    
    // Check if this is a wrapper class containing a 'head' property
    const headChild = initialChildren.find(c => c.name === 'head');

    if (headChild) {
        // If 'head' is null, the list is empty
        if (headChild.value === 'null' || headChild.variablesReference === 0) {
            return {
                kind: 'linkedList',
                name: variable.name,
                nodes: []
            };
        }
        // Otherwise, shift our starting point to the actual first Node
        startReference = headChild.variablesReference;
    }

    // Begin standard traversal starting from the first actual Node
    await this.traverse(startReference, session, nodes, 0);

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
