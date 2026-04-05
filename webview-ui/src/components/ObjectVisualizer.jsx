export default function ObjectVisualizer({ variable, prevVar }) {
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