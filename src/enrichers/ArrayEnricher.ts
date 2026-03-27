import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, ArrayVariable } from './types';

export class ArrayEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        return (
            variable.variablesReference > 0 &&
            (variable.value.includes('Array') || variable.value.includes('['))
        );
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<ArrayVariable> {
        const children = await fetchChildren(session, variable.variablesReference);
        const elements = children
            .filter((v) => !isNaN(parseInt(v.name))) 
            .map((e) => e.value);

        return {
            kind: 'array',
            name: variable.name,
            isArray: true,
            elements,
        };
    }
}
