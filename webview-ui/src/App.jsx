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
    if (!variable.isArray) {
        return (
            <div style={{ margin: '8px 0' }}>
                <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}:</span> {variable.value}
            </div>
        );
    }

    return (
        <div style={{ margin: '15px 0', padding: '10px', background: 'var(--vscode-editor-inactiveSelectionBackground)', borderRadius: '6px' }}>
            <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#75beff', fontWeight: 'bold' }}>{variable.name}</span> (Array)
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

export default App;
