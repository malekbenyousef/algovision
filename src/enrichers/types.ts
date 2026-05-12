import * as vscode from 'vscode';
import { RawVariable } from '../debugger/dapClient';


export interface VariableEnricher {
    canHandle(variable: RawVariable): boolean;

    enrich(variable: RawVariable, session: vscode.DebugSession): Promise<EnrichedVariable>;
}


export interface PrimitiveVariable {
    kind: 'primitive';
    name: string;
    value: string;
}

export interface ArrayVariable {
    kind: 'array';
    name: string;
    isArray: true;
    elements: string[];
}

export interface Array2DVariable {
    kind: 'array2d';
    name: string;
    rows: string[][];
}

export interface ObjectVariable {
    kind: 'object';
    name: string;
    isObject: true;
    entries: { key: string; value: string }[];
}

export interface LinkedListVariable {
    kind: 'linkedList';
    name: string;
    nodes: string[];
}

export interface TreeNodeData {
    value: string;
    left: TreeNodeData | null;
    right: TreeNodeData | null;
    variablesReference: number;
}

export interface TreeVariable {
    kind: 'tree';
    name: string;
    root: TreeNodeData | null;
}

export interface GraphVariable {
    kind: 'graph';
    name: string;
    nodes: string[];
    edges: { source: string; target: string }[];
}

export type EnrichedVariable = PrimitiveVariable | ArrayVariable | Array2DVariable | ObjectVariable | LinkedListVariable | TreeVariable | TreeNodeData | GraphVariable;
