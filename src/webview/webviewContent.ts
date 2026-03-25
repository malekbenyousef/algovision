import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewContent(webview: vscode.Webview, extensionPath: string, ): string {
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
