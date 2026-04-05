export default function ArrayVisualizer({ variable, prevVar }) {
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