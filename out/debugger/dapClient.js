"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRawVariables = fetchRawVariables;
exports.fetchChildren = fetchChildren;
async function fetchRawVariables(session) {
    const EXCLUDED_VARIABLE_NAMES = [
        'Return value',
        'this',
        '__dirname',
        '__filename',
        'exports',
        'module',
        'require',
    ];
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
        const filtered = variablesResponse.variables.filter((v) => !EXCLUDED_VARIABLE_NAMES.includes(v.name) &&
            !v.value.startsWith('ƒ') &&
            !v.value.startsWith('class'));
        allVariables = allVariables.concat(filtered);
    }
    for (const v of allVariables) {
        if (v.variablesReference > 0) {
            const children = await fetchChildren(session, v.variablesReference);
            console.log(`Children of ${v.name}:`, JSON.stringify(children, null, 2));
        }
    }
    return allVariables;
}
async function fetchChildren(session, variablesReference) {
    const response = await session.customRequest('variables', { variablesReference });
    return response.variables;
}
//# sourceMappingURL=dapClient.js.map