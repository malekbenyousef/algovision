import * as vscode from 'vscode';
import { fetchRawVariables } from '../debugger/dapClient';
import { enrichers } from '../enrichers';
import { EnrichedVariable } from '../enrichers/types';

export async function getEnrichedVariables(
    session: vscode.DebugSession
): Promise<EnrichedVariable[]> {
    const rawVariables = await fetchRawVariables(session);

    const enriched = await Promise.all(
        rawVariables.map((variable) => {
            const enricher = enrichers.find((e) => e.canHandle(variable));
            if (!enricher) {
                // Graceful fallback: log a warning and treat as primitive rather than crashing.
                console.warn(`[AlgoVision] No enricher matched variable "${variable.name}" (value: ${variable.value}). Falling back to primitive.`);
                return Promise.resolve({ kind: 'primitive' as const, name: variable.name, value: variable.value });
            }
            return enricher.enrich(variable, session);
        })
    );

    return enriched;
}



export async function getEnrichedVariablesWithRetry(
    session: vscode.DebugSession,
    retries = 5
): Promise<EnrichedVariable[]> {
    for (let i = 0; i < retries; i++) {
        try {

            const activeSession = vscode.debug.activeDebugSession ?? session;
            return await getEnrichedVariables(activeSession);
        } catch (error) {
            if (i === retries - 1) {throw error;}
            await new Promise((resolve) => setTimeout(resolve, 150 * (i + 1)));
        }
    }
    throw new Error('Unreachable');
}
