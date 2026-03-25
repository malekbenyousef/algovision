import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, ObjectVariable } from './types';

export class ObjectEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        return variable.type === 'Object' && variable.variablesReference > 0;
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<ObjectVariable> {
    
        const children = await fetchChildren(session, variable.variablesReference);
        const entries = children
            .filter((c) => c.presentationHint?.visibility !== 'internal')
            .map((c) => ({ key: c.name, value: c.value }));

        return {
            kind: 'object',
            name: variable.name,
            isObject: true,
            entries,
        };
    }
}
