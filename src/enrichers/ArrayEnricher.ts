import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, ArrayVariable } from './types';

/**
 * ArrayEnricher handles 1D arrays.
 * 2D arrays (matrices) are handled upstream by MatrixEnricher, which is
 * registered before this class in the enricher chain.
 */
export class ArrayEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        if (variable.variablesReference === 0) { return false; }
        // Node.js debug adapter sets type to 'Array' for real arrays.
        // Fall back to value-string heuristics only when type is absent (some adapters omit it).
        return (
            variable.type === 'Array' ||
            (!variable.type && (variable.value.startsWith('[') || /^\w*Array\(/.test(variable.value)))
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