import VisualizerCard from './VisualizerCard';

export default function MatrixVisualizer({ variable, prevVar }) {
  const hasAnyChange = variable.rows.some((row, r) =>
    row.some((val, c) => prevVar?.rows?.[r]?.[c] !== undefined && prevVar.rows[r][c] !== val)
  );

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="2D Matrix"
      kindColor="var(--av-kind-array2d)"
      hasChanged={hasAnyChange}
    >
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
          {variable.rows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{
                fontSize: 10, color: 'var(--av-text-faint)', fontFamily: 'var(--av-font-mono)',
                width: 18, textAlign: 'right', flexShrink: 0,
              }}>
                {rowIndex}
              </span>
              {row.map((val, colIndex) => {
                const prevVal = prevVar?.rows?.[rowIndex]?.[colIndex];
                const hasChanged = prevVal !== undefined && prevVal !== val;
                return (
                  <div
                    key={colIndex}
                    style={{
                      width: 40, height: 40,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                      borderRadius: 5,
                      fontFamily: 'var(--av-font-mono)', fontWeight: 700, fontSize: 12,
                      background: hasChanged ? 'var(--av-blue-primary)' : 'var(--av-surface-1)',
                      color: hasChanged ? '#fff' : 'var(--av-text-primary)',
                      transform: hasChanged ? 'scale(1.1)' : 'scale(1)',
                      zIndex: hasChanged ? 1 : 0,
                      position: 'relative',
                      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                      boxShadow: hasChanged ? '0 0 10px var(--av-blue-glow)' : 'none',
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </VisualizerCard>
  );
}