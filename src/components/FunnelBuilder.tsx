import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FunnelNode } from './FunnelNode';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { ValidationPanel } from './ValidationPanel';
import { MiniMap } from './MiniMap';
import { useFunnelStore } from '../hooks/useFunnelStore';
import { validateFunnel } from '../utils/validation';
import type { FunnelNodeType } from '../types';

const nodeTypes = {
  salesPage: FunnelNode,
  orderPage: FunnelNode,
  upsell: FunnelNode,
  downsell: FunnelNode,
  thankYou: FunnelNode,
};

export function FunnelBuilder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearCanvas,
    loadState,
    getState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFunnelStore();

  const issues = useMemo(() => validateFunnel(nodes, edges), [nodes, edges]);
  const nodeIdsWithWarning = useMemo(
    () => new Set(issues.map((i) => i.nodeId).filter(Boolean) as string[]),
    [issues]
  );
  const nodesWithWarnings = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, hasWarning: nodeIdsWithWarning.has(n.id) },
      })),
    [nodes, nodeIdsWithWarning]
  );

  const handleDragStart = useCallback((_e: React.DragEvent, _nodeType: FunnelNodeType) => {}, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.dataTransfer.types.includes('application/reactflow')) setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (related == null || !wrapperRef.current?.contains(related)) setIsDraggingOver(false);
  }, []);

  useEffect(() => {
    const clearDrop = () => setIsDraggingOver(false);
    document.addEventListener('dragend', clearDrop);
    return () => document.removeEventListener('dragend', clearDrop);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const nodeType = e.dataTransfer.getData('application/reactflow') as FunnelNodeType;
      if (!nodeType || !flowRef.current || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = flowRef.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });
      addNode(nodeType, position);
    },
    [addNode]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowRef.current = instance;
  }, []);

  const handleNodeFocus = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && flowRef.current) {
      flowRef.current.setCenter(node.position.x + 100, node.position.y + 50, {
        zoom: 1.2,
        duration: 400,
      });
    }
  }, [nodes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <Toolbar
        onImport={loadState}
        onExport={getState}
        onClear={clearCanvas}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        validationOpen={validationOpen}
        onToggleValidation={() => setValidationOpen((o) => !o)}
        validationIssueCount={issues.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onDragStart={handleDragStart} />

        <main
          ref={wrapperRef}
          className="relative flex-1"
          role="application"
          aria-label="Funnel canvas"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ReactFlow
            nodes={nodesWithWarnings as Node[]}
            edges={edges as Edge[]}
            onNodesChange={onNodesChange as never}
            onEdgesChange={onEdgesChange as never}
            onConnect={onConnect}
            onInit={onInit}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              markerEnd: { type: 'arrowclosed' as const },
              style: { stroke: '#64748B', strokeWidth: 2 },
            }}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode={['Shift']}
            multiSelectionKeyCode={['Control', 'Meta']}
            panOnScroll
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
            <Controls
              showInteractive={false}
              className="!rounded-lg !border !border-slate-200 !bg-white !shadow-sm"
              aria-label="Zoom"
            />
            <MiniMap />
          </ReactFlow>

          {isDraggingOver && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-500 bg-indigo-50/50"
              aria-hidden
            >
              <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md">
                Drop to add page
              </span>
            </div>
          )}

          <ValidationPanel
            nodes={nodes}
            edges={edges}
            open={validationOpen}
            onNodeFocus={handleNodeFocus}
          />

          {isEmpty && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
              aria-hidden
            >
              <div className="max-w-sm rounded-xl border-2 border-dashed border-slate-300 bg-white/95 px-8 py-6 text-center shadow-sm">
                <p className="text-base font-medium text-slate-700">No pages yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Drag a page type from the left sidebar and drop it here to start your funnel.
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  Pan: click + drag background. Connect: drag from ● (right) to ○ (left).
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
