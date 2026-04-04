import { useState, useEffect, useRef } from 'react';
const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

function App() {
    const [variables, setVariables] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const previousVariables = useRef([]);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === 'updateData') {
                console.log('Received from extension:', JSON.stringify(message.variables, null, 2));
                setVariables((currentVars) => {
                    previousVariables.current = currentVars;
                    return message.variables;
                });
            }
        };
        window.addEventListener('message', handleMessage);
        if (vscode) vscode.postMessage({ command: 'webviewReady' });
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => {
                if (vscode) {
                    vscode.postMessage({ command: 'stepOver' });
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [variables, isPlaying]);

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center border-b border-(--vscode-panel-border) pb-2.5">
                <h2 className="m-0 p-0 border-none font-semibold text-(--vscode-textPreformat-foreground) text-2xl">
                    AlgoVision
                </h2>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1.5 rounded-sm cursor-pointer font-bold border-none transition-colors duration-200 ${isPlaying
                        ? 'bg-(--vscode-errorForeground) text-white'
                        : 'bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground)'
                        }`}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Auto-Play'}
                </button>
            </div>

            <p className="opacity-70 mt-4 mb-6">
                {isPlaying ? 'Auto-stepping...' : 'Execution paused. Stepping through...'}
            </p>

            {variables.map((variable) => {
                const prevVar = previousVariables.current.find(p => p.name === variable.name);
                return <VariableNode key={variable.name} variable={variable} prevVar={prevVar} />;
            })}
        </div>
    );
}


function VariableNode({ variable, prevVar }) {
    if (variable.kind === 'linkedList') {
        return (
            <div className="my-4 p-3 bg-(--vscode-editor-inactiveSelectionBackground) rounded-md">
                <div className="mb-3">
                    <span className="font-bold text-[#75beff]">{variable.name}</span>
                    <span className="opacity-60 ml-1.5 text-[0.85em]">(Linked List)</span>
                </div>
                <div className="flex flex-wrap items-center gap-y-3">
                    {variable.nodes.map((val, index) => {
                        const hasChanged = prevVar && prevVar.nodes[index] !== val;

                        const borderColor = hasChanged ? 'border-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'border-[var(--vscode-panel-border)]';
                        const bgColor = hasChanged ? 'bg-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'bg-transparent';
                        const textColor = hasChanged ? 'text-white' : 'text-inherit';
                        const scale = hasChanged ? 'scale-110' : 'scale-100';

                        return (
                            <div key={index} className="flex items-center">
                                <div className={`flex border-2 ${borderColor} rounded-md overflow-hidden transition-all duration-300 ease-out ${scale}`}>
                                    <div className={`min-w-10 h-10 flex items-center justify-center font-bold px-2 transition-all duration-300 ease-out ${bgColor} ${textColor}`}>
                                        {val}
                                    </div>
                                    <div className={`w-7 h-10 flex items-center justify-center border-l-2 ${borderColor} opacity-60 text-[0.9em] transition-all duration-300 ease-out`}>
                                        →
                                    </div>
                                </div>
                                {index < variable.nodes.length - 1 && (
                                    <div className="w-4 h-0.5 bg-(--vscode-panel-border)" />
                                )}
                            </div>
                        );
                    })}
                    <div className="flex items-center">
                        <div className="w-4 h-0.5 bg-(--vscode-panel-border)" />
                        <div className="px-2.5 py-1 border-2 border-(--vscode-panel-border) rounded-md opacity-45 italic text-[0.85em]">
                            null
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variable.kind === 'object') {
        return (
            <div className="bg-(--vscode-editor-inactiveSelectionBackground) my-4 p-3 rounded-md">
                <div className="mb-3">
                    <span className="font-bold text-[#75beff]">{variable.name}</span>
                    <span className="opacity-60 ml-1.5 text-[0.85em]">(Object)</span>
                </div>
                <div className="flex flex-col gap-2">
                    {variable.entries.map(({ key, value }) => {
                        const prevEntry = prevVar?.entries?.find(e => e.key === key);
                        const hasChanged = prevEntry && prevEntry.value !== value;

                        const borderColor = hasChanged ? 'border-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'border-[var(--vscode-panel-border)]';
                        const highlightColor = hasChanged ? 'bg-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'bg-transparent';
                        const connectorColor = hasChanged ? 'bg-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'bg-[var(--vscode-panel-border)]';
                        const textColor = hasChanged ? 'text-white' : 'text-inherit';

                        return (
                            <div key={key} className="flex items-center">
                                <div className={`px-3 py-1.5 border-2 border-r-0 ${borderColor} rounded-l-md font-bold text-[#75beff] text-[0.9em] min-w-15 text-center bg-(--vscode-editor-background) transition-all duration-300 ease-out`}>
                                    {key}
                                </div>
                                <div className={`w-5 h-0.5 transition-all duration-300 ease-out ${connectorColor}`} />
                                <div className={`px-3 py-1.5 border-2 border-l-0 ${borderColor} rounded-r-md text-[0.9em] min-w-15 text-center transition-all duration-300 ease-out ${highlightColor} ${textColor}`}>
                                    {value}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (variable.kind === 'array') {
        return (
            <div className="bg-(--vscode-editor-inactiveSelectionBackground) my-4 p-3 rounded-md">
                <div className="mb-2.5">
                    <span className="font-bold text-[#75beff]">{variable.name}</span>
                    <span className="opacity-60 ml-1.5 text-[0.85em]">(Array)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {variable.elements.map((val, index) => {
                        const hasChanged = prevVar && prevVar.elements[index] !== val;

                        const borderColor = hasChanged ? 'border-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'border-[var(--vscode-panel-border)]';
                        const bgColor = hasChanged ? 'bg-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'bg-transparent';
                        const textColor = hasChanged ? 'text-white' : 'text-inherit';
                        const scale = hasChanged ? 'scale-125' : 'scale-100';

                        return (
                            <div key={index} className="flex flex-col items-center">
                                <div className={`w-11.25 h-11.25 flex items-center justify-center border-2 rounded-md font-bold transition-all duration-300 ease-out ${borderColor} ${scale} ${bgColor} ${textColor}`}>
                                    {val}
                                </div>
                                <span className="opacity-70 mt-1 text-[0.7em]">[{index}]</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // primitive fallback
    return (
        <div className="my-2">
            <span className="font-bold text-[#75beff]">{variable.name}:</span> {variable.value}
        </div>
    );
}

export default App;
