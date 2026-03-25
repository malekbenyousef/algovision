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
const variableService_1 = require("./services/variableService");
const webviewContent_1 = require("./webview/webviewContent");
function activate(context) {
    let panel = undefined;
    vscode.debug.registerDebugAdapterTrackerFactory('*', {
        createDebugAdapterTracker(session) {
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
    context.subscriptions.push(vscode.commands.registerCommand('algovision.visualize', async () => {
        const session = vscode.debug.activeDebugSession;
        if (!session) {
            return vscode.window.showErrorMessage('AlgoVision: No active debug session!');
        }
        if (!panel) {
            panel = createPanel(context);
            panel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'webviewReady') {
                    await pushVariablesToPanel(session, panel);
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
function createPanel(context) {
    const panel = vscode.window.createWebviewPanel('algovisionPanel', 'AlgoVision', vscode.ViewColumn.Beside, {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'webview-dist')),
        ],
    });
    panel.webview.html = (0, webviewContent_1.getWebviewContent)(panel.webview, context.extensionPath);
    return panel;
}
async function pushVariablesToPanel(session, panel, initialDelay = 0) {
    if (initialDelay) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
    }
    panel.webview.postMessage({ command: 'status', text: 'Fetching...' });
    try {
        const variables = await (0, variableService_1.getEnrichedVariablesWithRetry)(session);
        console.log('Sending to webview:', JSON.stringify(variables, null, 2));
        panel.webview.postMessage({ command: 'updateData', variables });
    }
    catch (error) {
        vscode.window.showErrorMessage(`AlgoVision fetch failed: ${error}`);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map