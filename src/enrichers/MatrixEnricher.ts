import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, Array2DVariable } from './types';

/**
 * MatrixEnricher handles 2D arrays (arrays of arrays).
 *
 * Detection strategy: the variable must be an array whose string representation
 * contains nested sub-arrays. Node.js renders these as:
 *   "[ [Array], [Array] ]"  or  "[ [ 1, 2 ], [ 3, 4 ] ]"
 *
 * This enricher is registered BEFORE ArrayEnricher so that 2D arrays are
 * claimed here instead of falling into ArrayEnricher.enrich() which would
 * then need an extra DAP round-trip to determine dimensionality.
 */
export class MatrixEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        if (variable.variablesReference === 0) { return false; }
        if (variable.type !== 'Array' && !variable.value.startsWith('[')) { return false; }

        // Node.js signals nested arrays by printing "[Array]" as a child placeholder,
        // or by having multiple sub-arrays in the value string.
        return (
            variable.value.includes('[Array]') ||
            /\[\s*\[/.test(variable.value)
        );
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<Array2DVariable> {
        const children = await fetchChildren(session, variable.variablesReference);
        const numericChildren = children.filter((v) => !isNaN(parseInt(v.name)));

        const rows: string[][] = [];
        for (const rowVar of numericChildren) {
            if (rowVar.variablesReference === 0) {
                // Flat value — treat as a single-element row (edge case)
                rows.push([rowVar.value]);
                continue;
            }
            const rowChildren = await fetchChildren(session, rowVar.variablesReference);
            const elements = rowChildren
                .filter((v) => !isNaN(parseInt(v.name)))
                .map((e) => e.value);
            rows.push(elements);
        }

        return {
            kind: 'array2d',
            name: variable.name,
            rows,
        };
    }
}
