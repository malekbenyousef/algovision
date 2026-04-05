import * as vscode from 'vscode';
import { RawVariable, fetchChildren } from '../debugger/dapClient';
import { VariableEnricher, ArrayVariable, Array2DVariable } from './types';

export class ArrayEnricher implements VariableEnricher {
	canHandle(variable: RawVariable): boolean {
		return (
			variable.variablesReference > 0 &&
			(variable.value.includes('Array') || variable.value.includes('['))
		);
	}

	async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<ArrayVariable | Array2DVariable> {
		const children = await fetchChildren(session, variable.variablesReference);
		const numericChildren = children.filter((v) => !isNaN(parseInt(v.name)));

		const is2D = numericChildren.length > 0 &&
			numericChildren[0].variablesReference > 0 &&
			(numericChildren[0].value.includes('Array') || numericChildren[0].value.includes('['));

		if (is2D) {
			const rows: string[][] = [];

			for (const rowVar of numericChildren) {
				const rowChildren = await fetchChildren(session, rowVar.variablesReference);
				const elements = rowChildren
					.filter((v) => !isNaN(parseInt(v.name)))
					.map(e => e.value);

				rows.push(elements);
			}

			return {
				kind: 'array2d',
				name: variable.name,
				rows,
			};
		}

		const elements = numericChildren.map((e) => e.value);
		return {
			kind: 'array',
			name: variable.name,
			isArray: true,
			elements,
		};
	}
}