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
const acorn = __importStar(require("acorn"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    let panel = undefined;
    context.subscriptions.push(vscode.commands.registerCommand('algovision.visualize', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return vscode.window.showErrorMessage('AlgoVision: No active editor found!');
        const code = editor.document.getText();
        try {
            const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
            panel = vscode.window.createWebviewPanel('algovisionPanel', 'AlgoVision', vscode.ViewColumn.Beside, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
            });
            panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
            panel.webview.postMessage({ command: 'updateData', ast: ast });
            panel.onDidDispose(() => {
                panel = undefined;
            }, null, context.subscriptions);
        }
        catch (error) {
            vscode.window.showErrorMessage('AlgoVision: Failed to parse JavaScript code.');
            console.error(error);
        }
    }));
}
function getWebviewContent(webview, extensionPath) {
    const htmlPath = path.join(extensionPath, 'webview', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    const stylePathOnDisk = vscode.Uri.file(path.join(extensionPath, 'webview', 'style.css'));
    const scriptPathOnDisk = vscode.Uri.file(path.join(extensionPath, 'webview', 'main.js'));
    const styleUri = webview.asWebviewUri(stylePathOnDisk);
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    html = html.replace('{{styleUri}}', styleUri.toString());
    html = html.replace('{{scriptUri}}', scriptUri.toString());
    return html;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map