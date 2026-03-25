"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRawVariables = fetchRawVariables;
exports.fetchChildren = fetchChildren;
/**
 * Fetches all raw local/closure variables for the top stack frame
 * of the first thread in the given debug session.
 * This function knows nothing about variable types — it just fetches.
 */
async function fetchRawVariables(session) {
    const threadsResponse = await session.customRequest('threads');
    const threadId = threadsResponse.threads[0].id;
    const stackTraceResponse = await session.customRequest('stackTrace', {
        threadId,
        levels: 1,
    });
    const frameId = stackTraceResponse.stackFrames[0].id;
    const scopesResponse = await session.customRequest('scopes', { frameId });
    const relevantScopes = scopesResponse.scopes.filter((scope) => scope.name.toLowerCase() !== 'global');
    if (relevantScopes.length === 0)
        return [];
    let allVariables = [];
    for (const scope of relevantScopes) {
        const variablesResponse = await session.customRequest('variables', {
            variablesReference: scope.variablesReference,
        });
        allVariables = allVariables.concat(variablesResponse.variables);
    }
    return allVariables;
}
/**
 * Fetches the child variables of a reference (e.g. array elements, object fields).
 */
async function fetchChildren(session, variablesReference) {
    const response = await session.customRequest('variables', { variablesReference });
    return response.variables;
}
//# sourceMappingURL=dapClient.js.map