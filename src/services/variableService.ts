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
            return enricher!.enrich(variable, session); 
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
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, 150 * (i + 1)));
        }
    }
    throw new Error('Unreachable');
}
