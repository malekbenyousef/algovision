export default function MatrixVisualizer({ variable, prevVar }) {
  return (
    <div className="bg-(--vscode-editor-inactiveSelectionBackground) my-4 p-3 rounded-md overflow-x-auto">
      <div className="mb-3">
        <span className="font-bold text-[#75beff]">{variable.name}</span>
        <span className="opacity-60 ml-1.5 text-[0.85em]">(2D Matrix)</span>
      </div>

      <div className="inline-flex flex-col gap-1">
        {variable.rows.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="flex gap-1">
              {row.map((val, colIndex) => {
                const prevVal = prevVar?.rows?.[rowIndex]?.[colIndex];
                const hasChanged = prevVal !== undefined && prevVal !== val;

                const borderColor = hasChanged ? 'border-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'border-[var(--vscode-panel-border)]';
                const bgColor = hasChanged ? 'bg-[var(--vscode-editorInfo-foreground,#3794ff)]' : 'bg-[var(--vscode-editor-background)]';
                const textColor = hasChanged ? 'text-white' : 'text-inherit';
                const scale = hasChanged ? 'scale-110 z-10' : 'scale-100 z-0';

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-10 h-10 flex items-center justify-center border-2 rounded-sm font-mono font-bold text-[0.9em] transition-all duration-300 ease-out relative ${borderColor} ${bgColor} ${textColor} ${scale}`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}