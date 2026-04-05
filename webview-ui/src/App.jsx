import { useState, useEffect } from 'react';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import ObjectVisualizer from './components/ObjectVisualizer';
import ArrayVisualizer from './components/ArrayVisualizer';
import MatrixVisualizer from './components/MatrixVisualizer';
import PrimitiveVisualizer from './components/PrimitiveVisualizer';

const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

function App() {
	const [variables, setVariables] = useState([]);
	const [isPlaying, setIsPlaying] = useState(false);
	const [previousVariables, setPreviousVariables] = useState([]);

	useEffect(() => {
		const handleMessage = (event) => {
			const message = event.data;
			if (message.command === 'updateData') {
				setVariables((currentVars) => {
					setPreviousVariables(currentVars);
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
			}, 400);
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
				const prevVar = previousVariables.find(p => p.name === variable.name);

				switch (variable.kind) {
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