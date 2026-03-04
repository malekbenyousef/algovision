import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "algovision" is now active!');

    const disposable = vscode.commands.registerCommand('algovision.visualize', () => {
        const panel = vscode.window.createWebviewPanel(
            'pythonViz', 
            'AlgoVision: Python Visualizer', 
            vscode.ViewColumn.Two, 
            { enableScripts: true } 
        );
    
        panel.webview.html = `
            <!DOCTYPE html>
            <html>
                <body style="background-color: white; color: black;">
                    <h1>AlgoVision</h1>
                    <div id="graph"></div>
                </body>
            </html>
        `;
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}