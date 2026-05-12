import VisualizerCard from './VisualizerCard';

export default function PrimitiveVisualizer({ variable }) {
  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="Primitive"
      kindColor="var(--av-kind-primitive)"
      hasChanged={false}
    >
      <span style={{
        fontFamily: 'var(--av-font-mono)',
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--av-blue-label)',
      }}>
        {variable.value}
      </span>
    </VisualizerCard>
  );
}