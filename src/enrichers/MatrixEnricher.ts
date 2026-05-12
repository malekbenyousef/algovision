import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, Array2DVariable } from './types';

/**
 * MatrixEnricher handles 2D arrays (arrays of arrays).
 *
 * Node.js can represent a 2D array's value in several formats:
 *   "[ [Array], [Array] ]"       — long rows (≥ ~7 elements)
 *   "[ [ 1, 2 ], [ 3, 4 ] ]"    — short rows shown inline
 *   "[ Array(4), Array(4) ]"     — another compact form (no square brackets)
 *
 * We detect by checking the value string AND by peeking at children
 * to confirm they are themselves array references.
 */
export class MatrixEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        if (variable.variablesReference === 0) { return false; }
        if (variable.type !== 'Array' && !variable.value.startsWith('[')) { return false; }

        return (
            variable.value.includes('[Array]') ||   // "[ [Array], [Array] ]"
            variable.value.includes('Array(')  ||   // "[ Array(4), Array(4) ]"
            /\[\s*\[/.test(variable.value)          // "[ [ 1, 2 ], [ 3, 4 ] ]"
        );
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<Array2DVariable> {
        const children = await fetchChildren(session, variable.variablesReference);
        const numericChildren = children.filter((v) => !isNaN(parseInt(v.name)));

        const rows: string[][] = [];
        for (const rowVar of numericChildren) {
            if (rowVar.variablesReference === 0) {
                rows.push([rowVar.value]);
                continue;
            }
            const rowChildren = await fetchChildren(session, rowVar.variablesReference);
            const elements = rowChildren
                .filter((v) => !isNaN(parseInt(v.name)))
                .map((e) => e.value);
            rows.push(elements);
        }

        return { kind: 'array2d', name: variable.name, rows };
    }
}
