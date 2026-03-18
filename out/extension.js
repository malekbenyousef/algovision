"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    let panel = undefined;
    vscode.debug.registerDebugAdapterTrackerFactory('*', {
        createDebugAdapterTracker(session) {
            return {
                async onDidSendMessage(message) {
                    if (message.type === 'event' && message.event === 'stopped') {
                        const activeSession = vscode.debug.activeDebugSession ?? session;
                        if (panel && activeSession) {
                            await fetchAndSendVariablesWithRetry(activeSession, panel);
                        }
                    }
                }
            };
        }
    });
    context.subscriptions.push(vscode.commands.registerCommand('algovision.visualize', async () => {
        const session = vscode.debug.activeDebugSession;
        if (!session)
            return vscode.window.showErrorMessage('AlgoVision: No active debug session!');
        if (!panel) {
            panel = vscode.window.createWebviewPanel('algovisionPanel', 'AlgoVision', vscode.ViewColumn.Beside, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview-dist'))]
            });
            panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
            panel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'webviewReady') {
                    await fetchAndSendVariablesWithRetry(session, panel);
                }
                else if (message.command === 'stepOver') {
                    vscode.commands.executeCommand('workbench.action.debug.stepOver');
                }
            }, undefined, context.subscriptions);
            panel.onDidDispose(() => { panel = undefined; }, null, context.subscriptions);
        }
        else {
            panel.reveal(vscode.ViewColumn.Beside);
        }
    }));
}
async function fetchAndSendVariablesWithRetry(session, panel, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetchAndSendVariables(session, panel);
            return;
        }
        catch (error) {
            if (i === retries - 1) {
                vscode.window.showErrorMessage(`AlgoVision fetch failed: ${error}`);
            }
            else {
                await new Promise(resolve => setTimeout(resolve, 150 * (i + 1)));
            }
        }
    }
}
async function fetchAndSendVariables(session, panel) {
    panel.webview.postMessage({ command: 'status', text: 'Fetching...' });
    const threadsResponse = await session.customRequest('threads');
    const threadId = threadsResponse.threads[0].id;
    const stackTraceResponse = await session.customRequest('stackTrace', { threadId: threadId, levels: 1 });
    const frameId = stackTraceResponse.stackFrames[0].id;
    const scopesResponse = await session.customRequest('scopes', { frameId: frameId });
    const relevantScopes = scopesResponse.scopes.filter((scope) => scope.name.toLowerCase() !== 'global');
    if (relevantScopes.length === 0)
        return;
    let allVariables = [];
    for (const scope of relevantScopes) {
        const variablesResponse = await session.customRequest('variables', { variablesReference: scope.variablesReference });
        allVariables = allVariables.concat(variablesResponse.variables);
    }
    const enhancedVariables = [];
    for (const variable of allVariables) {
        const isArray = variable.variablesReference > 0 && (variable.value.includes('Array') || variable.value.includes('['));
        if (isArray) {
            const arrayContents = await session.customRequest('variables', { variablesReference: variable.variablesReference });
            const elementsOnly = arrayContents.variables.filter((v) => !isNaN(parseInt(v.name)));
            enhancedVariables.push({
                name: variable.name,
                isArray: true,
                elements: elementsOnly.map((e) => e.value)
            });
        }
        else {
            enhancedVariables.push(variable);
        }
    }
    panel.webview.postMessage({ command: 'updateData', variables: enhancedVariables });
}
function getWebviewContent(webview, extensionPath) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'webview-dist', 'assets', 'index.js')));
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'webview-dist', 'assets', 'index.css')));
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AlgoVision</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <div id="root"></div>
            <script type="module" crossorigin src="${scriptUri}"></script>
        </body>
        </html>
    `;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map