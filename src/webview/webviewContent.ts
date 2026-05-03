import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewContent(webview: vscode.Webview, extensionPath: string, ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(extensionPath, 'webview-dist', 'assets', 'index.js'))
    );
    const styleUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(extensionPath, 'webview-dist', 'assets', 'index.css'))
    );

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
            <title>AlgoVision</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}" type="module" crossorigin src="${scriptUri}"></script>
        </body>
        </html>
    `;
}

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i += 1) {
        value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return value;
}
