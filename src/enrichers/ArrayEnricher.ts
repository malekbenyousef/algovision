import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, ArrayVariable, Array2DVariable } from './types';

/**
 * ArrayEnricher handles 1D arrays.
 * It also contains a FALLBACK 2D detection for compact `Array(N)` representations
 * that MatrixEnricher.canHandle() cannot detect without I/O.
 * MatrixEnricher is still registered first and handles the obvious cases.
 */
export class ArrayEnricher implements VariableEnricher {
    canHandle(variable: RawVariable): boolean {
        if (variable.variablesReference === 0) { return false; }
        return (
            variable.type === 'Array' ||
            (!variable.type && (variable.value.startsWith('[') || /^\w*Array\(/.test(variable.value)))
        );
    }

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<ArrayVariable | Array2DVariable> {
        const children = await fetchChildren(session, variable.variablesReference);
        const numericChildren = children.filter((v) => !isNaN(parseInt(v.name)));

        // Fallback 2D detection: if the first numeric child is itself an array reference,
        // this is a matrix that MatrixEnricher couldn't detect from the value string alone.
        const is2D = numericChildren.length > 0 &&
            numericChildren[0].variablesReference > 0 &&
            (numericChildren[0].value.includes('Array') || numericChildren[0].value.startsWith('['));

        if (is2D) {
            const rows: string[][] = [];
            for (const rowVar of numericChildren) {
                if (rowVar.variablesReference === 0) {
                    rows.push([rowVar.value]);
                    continue;
                }
                const rowChildren = await fetchChildren(session, rowVar.variablesReference);
                const elements = rowChildren
                    .filter((v) => !isNaN(parseInt(v.name)))
                    .map(e => e.value);
                rows.push(elements);
            }
            return { kind: 'array2d', name: variable.name, rows };
        }

        const elements = numericChildren.map((e) => e.value);
        return { kind: 'array', name: variable.name, isArray: true, elements };
    }
}