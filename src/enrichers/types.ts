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


export type EnrichedVariable = PrimitiveVariable | ArrayVariable| ObjectVariable | LinkedListVariable;
