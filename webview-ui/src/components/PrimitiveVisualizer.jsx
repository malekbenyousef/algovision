export default function PrimitiveVisualizer({ variable }) {
  return (
    <div className="my-2">
      <span className="font-bold text-[#75beff]">{variable.name}:</span> {variable.value}
    </div>
  );
}