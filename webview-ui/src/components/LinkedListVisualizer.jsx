export default function LinkedListVisualizer({ variable, prevVar }) {
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