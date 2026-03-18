import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let panel: vscode.WebviewPanel | undefined = undefined;

    vscode.debug.registerDebugAdapterTrackerFactory('*', {
        createDebugAdapterTracker(session: vscode.DebugSession) {
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

    context.subscriptions.push(
        vscode.commands.registerCommand('algovision.visualize', async () => {
            const session = vscode.debug.activeDebugSession;
            if (!session) return vscode.window.showErrorMessage('AlgoVision: No active debug session!');

            if (!panel) {
                panel = vscode.window.createWebviewPanel(
                    'algovisionPanel',
                    'AlgoVision',
                    vscode.ViewColumn.Beside,
                    {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview-dist'))]
                    }
                );

                panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
                
                panel.webview.onDidReceiveMessage(
                    async (message) => {
                        if (message.command === 'webviewReady') {
                            await fetchAndSendVariablesWithRetry(session, panel!);
                        }
                        else if (message.command === 'stepOver') {
                            vscode.commands.executeCommand('workbench.action.debug.stepOver');
                        }
                    },
                    undefined,
                    context.subscriptions
                );

                panel.onDidDispose(() => { panel = undefined; }, null, context.subscriptions);
            } else {
                panel.reveal(vscode.ViewColumn.Beside);
            }
            
        })
    );
}

async function fetchAndSendVariablesWithRetry(
    session: vscode.DebugSession, 
    panel: vscode.WebviewPanel, 
    retries = 5  
) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetchAndSendVariables(session, panel);
            return;
        } catch (error) {
            if (i === retries - 1) {
                vscode.window.showErrorMessage(`AlgoVision fetch failed: ${error}`);
            } else {
                await new Promise(resolve => setTimeout(resolve, 150 * (i + 1))); 
            }
        }
    }
}

async function fetchAndSendVariables(session: vscode.DebugSession, panel: vscode.WebviewPanel) {

    panel.webview.postMessage({ command: 'status', text: 'Fetching...' });
    const threadsResponse = await session.customRequest('threads');
    const threadId = threadsResponse.threads[0].id;
    const stackTraceResponse = await session.customRequest('stackTrace', { threadId: threadId, levels: 1 });
    const frameId = stackTraceResponse.stackFrames[0].id;
    const scopesResponse = await session.customRequest('scopes', { frameId: frameId });
    
    const relevantScopes = scopesResponse.scopes.filter((scope: any) => scope.name.toLowerCase() !== 'global');
    if (relevantScopes.length === 0) return;

    let allVariables: any[] = [];
    for (const scope of relevantScopes) {
        const variablesResponse = await session.customRequest('variables', { variablesReference: scope.variablesReference });
        allVariables = allVariables.concat(variablesResponse.variables);
    }

    const enhancedVariables = [];
    for (const variable of allVariables) {
        const isArray = variable.variablesReference > 0 && (variable.value.includes('Array') || variable.value.includes('['));
        
        if (isArray) {
            const arrayContents = await session.customRequest('variables', { variablesReference: variable.variablesReference });
            const elementsOnly = arrayContents.variables.filter((v: any) => !isNaN(parseInt(v.name)));
            
            enhancedVariables.push({
                name: variable.name,
                isArray: true,
                elements: elementsOnly.map((e: any) => e.value)
            });
        } else {
            enhancedVariables.push(variable);
        }
    }
    panel.webview.postMessage({ command: 'updateData', variables: enhancedVariables });
}

function getWebviewContent(webview: vscode.Webview, extensionPath: string) {
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

export function deactivate() {}
