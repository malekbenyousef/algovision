import * as vscode from 'vscode';
import * as path from 'path';
import { getEnrichedVariablesWithRetry } from './services/variableService';
import { getWebviewContent } from './webview/webviewContent';

export function activate(context: vscode.ExtensionContext) {
    let panel: vscode.WebviewPanel | undefined = undefined;

    vscode.debug.registerDebugAdapterTrackerFactory('*', {
        createDebugAdapterTracker(session: vscode.DebugSession) {
            return {
                async onDidSendMessage(message) {
                    if (message.type === 'event' && message.event === 'stopped') {
                        if (panel) {
                            const session = vscode.debug.activeDebugSession;
                            if (session) {
                                await pushVariablesToPanel(session, panel);
                            }
                        }
                    }
                }
            };
        },
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('algovision.visualize', async () => {
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                return vscode.window.showErrorMessage('AlgoVision: No active debug session!');
            }

            if (!panel) {
                panel = createPanel(context);
                panel.webview.onDidReceiveMessage(
                    async (message) => {
                        if (message.command === 'webviewReady') {
                            await pushVariablesToPanel(session, panel!);
                        } else if (message.command === 'stepOver') {
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

function createPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
        'algovisionPanel',
        'AlgoVision',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'webview-dist')),
            ],
        }
    );

    panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
    return panel;
}

async function pushVariablesToPanel(

    session: vscode.DebugSession,
    panel: vscode.WebviewPanel,
    initialDelay = 0
) {
    if (initialDelay) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
    }
    panel.webview.postMessage({ command: 'status', text: 'Fetching...' });
    try {
        const variables = await getEnrichedVariablesWithRetry(session);

        console.log('Sending to webview:', JSON.stringify(variables, null, 2));
        panel.webview.postMessage({ command: 'updateData', variables });
    } catch (error) {
        vscode.window.showErrorMessage(`AlgoVision fetch failed: ${error}`);
    }
}

export function deactivate() {}
