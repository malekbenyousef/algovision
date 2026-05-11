import { useState, useEffect } from 'react';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import ObjectVisualizer from './components/ObjectVisualizer';
import ArrayVisualizer from './components/ArrayVisualizer';
import MatrixVisualizer from './components/MatrixVisualizer';
import PrimitiveVisualizer from './components/PrimitiveVisualizer';
import TreeVisualizer from './components/TreeVisualizer';

const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

function isEnrichedVariable(variable) {
	if (!variable || typeof variable !== 'object' || typeof variable.name !== 'string' || typeof variable.kind !== 'string') {
		return false;
	}
	return ['primitive', 'array', 'array2d', 'object', 'linkedList','tree'].includes(variable.kind);
}

function isUpdateDataMessage(message) {
	return message?.command === 'updateData' &&
		Array.isArray(message.variables) &&
		message.variables.every(isEnrichedVariable);
}

function App() {
  const [state, setState] = useState({ variables: [], previousVariables: [] });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data;
      if (isUpdateDataMessage(message)) {
        setState(current => ({
          previousVariables: current.variables,
          variables: message.variables,
        }));
      }
    };
    window.addEventListener('message', handleMessage);
    if (vscode) vscode.postMessage({ command: 'webviewReady' });
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (vscode) vscode.postMessage({ command: 'stepOver' });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [state.variables, isPlaying]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center border-b border-(--vscode-panel-border) pb-2.5">
        <h2 className="m-0 p-0 border-none font-semibold text-(--vscode-textPreformat-foreground) text-2xl">
          AlgoVision
        </h2>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-sm cursor-pointer font-bold border-none transition-colors duration-200 ${
            isPlaying
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
      {state.variables.map((variable) => {
        const prevVar = state.previousVariables.find(p => p.name === variable.name);
        switch (variable.kind) {
          case 'tree':
            return <TreeVisualizer key={variable.name} variable={variable} prevVar={prevVar} />;
          case 'linkedList':
            return <LinkedListVisualizer key={variable.name} variable={variable} prevVar={prevVar} />;
          case 'object':
            return <ObjectVisualizer key={variable.name} variable={variable} prevVar={prevVar} />;
          case 'array2d':
            return <MatrixVisualizer key={variable.name} variable={variable} prevVar={prevVar} />;
          case 'array':
            return <ArrayVisualizer key={variable.name} variable={variable} prevVar={prevVar} />;
          default:
            return <PrimitiveVisualizer key={variable.name} variable={variable} />;
        }
      })}
    </div>
  );
}

export default App;