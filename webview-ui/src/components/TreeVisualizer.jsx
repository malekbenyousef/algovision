import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ─── Custom Node ────────────────────────────────────────────────────────────
function BSTNode({ data }) {
  const { label, hasChanged, isGhost } = data;

  if (isGhost) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'transparent',
          border: '1.5px dashed rgba(255,255,255,0.18)',
        }} />
      </>
    );
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: hasChanged
            ? 'linear-gradient(135deg, #3794ff 0%, #1a6fd4 100%)'
            : 'linear-gradient(135deg, #2a2d3e 0%, #1e2030 100%)',
          border: hasChanged
            ? '2px solid #5baeff'
            : '2px solid rgba(255,255,255,0.12)',
          boxShadow: hasChanged
            ? '0 0 18px rgba(55,148,255,0.45), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          transform: hasChanged ? 'scale(1.12)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'default',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 15,
          fontWeight: 700,
          color: hasChanged ? '#fff' : 'rgba(255,255,255,0.75)',
          letterSpacing: '-0.5px',
          userSelect: 'none',
        }}
      >
        {label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="left"
        style={{
          left: '28%',
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="right"
        style={{
          left: '72%',
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
}

const nodeTypes = { bstNode: BSTNode };

// ─── Layout Builder ──────────────────────────────────────────────────────────
let nodeId = 0;

function buildGraph(node, prevNode, nodes, edges, x, y, xOffset) {
  if (!node) return null;

  const id = `node-${nodeId++}`;
  const hasChanged = prevNode ? prevNode.value !== node.value : true;

  nodes.push({
    id,
    type: 'bstNode',
    position: { x, y },
    data: { label: String(node.value), hasChanged },
    style: { background: 'transparent', border: 'none', padding: 0 },
  });

  const childY = y + 90;
  const half = xOffset / 2;

  if (node.left || node.right) {
    // Left child or ghost
    if (node.left) {
      const leftId = buildGraph(node.left, prevNode?.left, nodes, edges, x - xOffset, childY, half);
      edges.push({
        id: `e-${id}-${leftId}`,
        source: id,
        target: leftId,
        sourceHandle: 'left',
        animated: hasChanged,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.25)',
        },
        style: {
          stroke: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.18)',
          strokeWidth: hasChanged ? 2 : 1.5,
        },
        label: 'L',
        labelStyle: {
          fill: 'rgba(255,255,255,0.3)',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: { fill: 'transparent' },
      });
    } else {
      const ghostId = `ghost-${nodeId++}`;
      nodes.push({
        id: ghostId,
        type: 'bstNode',
        position: { x: x - xOffset, y: childY },
        data: { isGhost: true },
        style: { background: 'transparent', border: 'none', padding: 0 },
      });
      edges.push({
        id: `e-${id}-${ghostId}`,
        source: id,
        target: ghostId,
        sourceHandle: 'left',
        style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: 'rgba(255,255,255,0.08)',
        },
      });
    }

    // Right child or ghost
    if (node.right) {
      const rightId = buildGraph(node.right, prevNode?.right, nodes, edges, x + xOffset, childY, half);
      edges.push({
        id: `e-${id}-${rightId}`,
        source: id,
        target: rightId,
        sourceHandle: 'right',
        animated: hasChanged,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.25)',
        },
        style: {
          stroke: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.18)',
          strokeWidth: hasChanged ? 2 : 1.5,
        },
        label: 'R',
        labelStyle: {
          fill: 'rgba(255,255,255,0.3)',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: { fill: 'transparent' },
      });
    } else {
      const ghostId = `ghost-${nodeId++}`;
      nodes.push({
        id: ghostId,
        type: 'bstNode',
        position: { x: x + xOffset, y: childY },
        data: { isGhost: true },
        style: { background: 'transparent', border: 'none', padding: 0 },
      });
      edges.push({
        id: `e-${id}-${ghostId}`,
        source: id,
        target: ghostId,
        sourceHandle: 'right',
        style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: 'rgba(255,255,255,0.08)',
        },
      });
    }
  }

  return id;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TreeVisualizer({ variable, prevVar }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!variable?.root) return { initialNodes: [], initialEdges: [] };

    nodeId = 0;
    const nodes = [];
    const edges = [];
    const isInitialRender = !prevVar;
    const prevRoot = isInitialRender ? variable.root : prevVar?.root;

    buildGraph(variable.root, prevRoot, nodes, edges, 0, 0, 160);
    return { initialNodes: nodes, initialEdges: edges };
  }, [variable, prevVar]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!variable?.root) return null;

  return (
    <div style={{
      margin: '16px 0',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--vscode-editor-inactiveSelectionBackground, #252535)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: 420,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: '#75beff',
          fontSize: 13,
        }}>
          {variable.name}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
        }}>
          Binary Tree
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#3794ff',
            boxShadow: '0 0 6px #3794ff',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            changed
          </span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#2a2d3e',
            border: '1.5px solid rgba(255,255,255,0.2)',
            display: 'inline-block',
            marginLeft: 8,
          }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            unchanged
          </span>
        </div>
      </div>

      {/* Flow canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background
            color="rgba(255,255,255,0.04)"
            gap={24}
            size={1}
          />
          <Controls
            style={{
              background: 'rgba(30,32,46,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}