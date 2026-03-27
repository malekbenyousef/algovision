import * as vscode from 'vscode';
import { RawVariable } from '../debugger/dapClient';
import { VariableEnricher, PrimitiveVariable } from './types';


export class PrimitiveEnricher implements VariableEnricher {
    canHandle(_variable: RawVariable): boolean {
        return true; 
    }

    async enrich(variable: RawVariable, _session: vscode.DebugSession): Promise<PrimitiveVariable> {
        return {
            kind: 'primitive',
            name: variable.name,
            value: variable.value,
        };
    }
}
