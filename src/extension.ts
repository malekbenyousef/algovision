import * as vscode from 'vscode';
import * as acorn from 'acorn';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('AlgoVision is now active!');

    let disposable = vscode.commands.registerCommand('algovision.visualize', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return vscode.window.showErrorMessage('AlgoVision: No active editor found!');

        const code = editor.document.getText();

        try {
            const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });

            const panel = vscode.window.createWebviewPanel(
                'algovisionPanel',
                'AlgoVision',
                vscode.ViewColumn.Beside, 
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
                }
            );

            panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
            panel.webview.postMessage({ command: 'updateData', ast: ast });

        } catch (error) {
            vscode.window.showErrorMessage('AlgoVision: Failed to parse JavaScript code.');
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionPath: string) {
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

export function deactivate() {}