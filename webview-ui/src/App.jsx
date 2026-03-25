import { useState, useEffect, useRef } from 'react';
import './App.css';

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
        <div className="app-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--vscode-panel-border)', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, border: 'none', padding: 0 }}>AlgoVision</h2>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        background: isPlaying ? 'var(--vscode-errorForeground)' : 'var(--vscode-button-background)',
                        color: 'var(--vscode-button-foreground)',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Auto-Play'}
                </button>
            </div>

            <p style={{ opacity: 0.7 }}>
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
            <div style={{ margin: '15px 0', padding: '10px', background: 'var(--vscode-editor-inactiveSelectionBackground)', borderRadius: '6px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.85em', marginLeft: '6px' }}>(Linked List)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: '12px' }}>
                    {variable.nodes.map((val, index) => {
                        const hasChanged = prevVar && prevVar.nodes[index] !== val;
                        return (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Node box: value section + pointer section */}
                                <div style={{
                                    display: 'flex',
                                    border: `2px solid ${hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'var(--vscode-panel-border)'}`,
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease-out',
                                    transform: hasChanged ? 'scale(1.1)' : 'scale(1)',
                                }}>
                                    {/* Value half */}
                                    <div style={{
                                        minWidth: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        padding: '0 8px',
                                        backgroundColor: hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'transparent',
                                        color: hasChanged ? '#fff' : 'inherit',
                                        transition: 'all 0.3s ease-out',
                                    }}>
                                        {val}
                                    </div>
                                    {/* Pointer half */}
                                    <div style={{
                                        width: '28px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderLeft: `2px solid ${hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'var(--vscode-panel-border)'}`,
                                        opacity: 0.6,
                                        fontSize: '0.9em',
                                        transition: 'all 0.3s ease-out',
                                    }}>
                                        →
                                    </div>
                                </div>
                                {/* Connector line between nodes */}
                                {index < variable.nodes.length - 1 && (
                                    <div style={{
                                        width: '16px',
                                        height: '2px',
                                        background: 'var(--vscode-panel-border)',
                                    }} />
                                )}
                            </div>
                        );
                    })}
                    {/* Null terminator */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '16px',
                            height: '2px',
                            background: 'var(--vscode-panel-border)',
                        }} />
                        <div style={{
                            padding: '4px 10px',
                            border: '2px solid var(--vscode-panel-border)',
                            borderRadius: '4px',
                            opacity: 0.45,
                            fontStyle: 'italic',
                            fontSize: '0.85em',
                        }}>
                            null
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variable.kind === 'object') {
        return (
            <div style={{ margin: '15px 0', padding: '10px', background: 'var(--vscode-editor-inactiveSelectionBackground)', borderRadius: '6px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.85em', marginLeft: '6px' }}>(Object)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {variable.entries.map(({ key, value }) => {
                        const prevEntry = prevVar?.entries?.find(e => e.key === key);
                        const hasChanged = prevEntry && prevEntry.value !== value;
                        return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Key box */}
                                <div style={{
                                    padding: '6px 12px',
                                    border: `2px solid ${hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'var(--vscode-panel-border)'}`,
                                    borderRight: 'none',
                                    borderRadius: '4px 0 0 4px',
                                    fontWeight: 'bold',
                                    color: '#75beff',
                                    fontSize: '0.9em',
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    background: 'var(--vscode-editor-background)',
                                    transition: 'all 0.3s ease-out',
                                }}>
                                    {key}
                                </div>
                                {/* Connector line */}
                                <div style={{
                                    width: '20px',
                                    height: '2px',
                                    background: hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'var(--vscode-panel-border)',
                                    transition: 'all 0.3s ease-out',
                                }} />
                                {/* Value box */}
                                <div style={{
                                    padding: '6px 12px',
                                    border: `2px solid ${hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'var(--vscode-panel-border)'}`,
                                    borderLeft: 'none',
                                    borderRadius: '0 4px 4px 0',
                                    fontSize: '0.9em',
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    backgroundColor: hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'transparent',
                                    color: hasChanged ? '#fff' : 'inherit',
                                    transition: 'all 0.3s ease-out',
                                }}>
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
            <div style={{ margin: '15px 0', padding: '10px', background: 'var(--vscode-editor-inactiveSelectionBackground)', borderRadius: '6px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.85em', marginLeft: '6px' }}>(Array)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {variable.elements.map((val, index) => {
                        const hasChanged = prevVar && prevVar.elements[index] !== val;
                        return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--vscode-panel-border)',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease-out',
                                    transform: hasChanged ? 'scale(1.2)' : 'scale(1)',
                                    backgroundColor: hasChanged ? 'var(--vscode-editorInfo-foreground, #3794ff)' : 'transparent',
                                    color: hasChanged ? '#fff' : 'inherit',
                                }}>
                                    {val}
                                </div>
                                <span style={{ fontSize: '0.7em', marginTop: '4px', opacity: 0.7 }}>[{index}]</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // primitive fallback
    return (
        <div style={{ margin: '8px 0' }}>
            <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}:</span> {variable.value}
        </div>
    );
}

export default App;
