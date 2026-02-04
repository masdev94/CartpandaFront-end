import { useCallback, useRef, useEffect } from 'react';
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
import type { FunnelNodeType } from '../types';

// Register custom node types
const nodeTypes = {
  salesPage: FunnelNode,
  orderPage: FunnelNode,
  upsell: FunnelNode,
  downsell: FunnelNode,
  thankYou: FunnelNode,
};

/**
 * Main FunnelBuilder component.
 * Combines the canvas, sidebar, toolbar, and validation panel.
 */
export function FunnelBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const draggedTypeRef = useRef<FunnelNodeType | null>(null);

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

  // Handle drag start from sidebar
  const handleDragStart = useCallback(
    (event: React.DragEvent, nodeType: FunnelNodeType) => {
      draggedTypeRef.current = nodeType;
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // Handle drag over canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as FunnelNodeType;
      if (!nodeType || !reactFlowInstance.current || !reactFlowWrapper.current) {
        return;
      }

      // Get the position relative to the canvas
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(nodeType, position);
      draggedTypeRef.current = null;
    },
    [addNode]
  );

  // Handle React Flow initialization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance as ReactFlowInstance;
  }, []);

  // Focus on a node (used by validation panel)
  const handleNodeFocus = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && reactFlowInstance.current) {
      reactFlowInstance.current.setCenter(node.position.x + 90, node.position.y + 60, {
        zoom: 1.5,
        duration: 500,
      });
    }
  }, [nodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <Toolbar
        onImport={loadState}
        onExport={getState}
        onClear={clearCanvas}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar onDragStart={handleDragStart} />

        {/* Canvas */}
        <main
          className="flex-1 relative"
          ref={reactFlowWrapper}
          role="application"
          aria-label="Funnel canvas"
        >
          <ReactFlow
            nodes={nodes as Node[]}
            edges={edges as Edge[]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onNodesChange={onNodesChange as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onEdgesChange={onEdgesChange as any}
            onConnect={onConnect}
            onInit={handleInit}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              markerEnd: { type: 'arrowclosed' as const },
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode={['Shift']}
            multiSelectionKeyCode={['Control', 'Meta']}
            panOnScroll
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
          >
            {/* Grid background */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#D1D5DB"
            />

            {/* Zoom controls */}
            <Controls
              showInteractive={false}
              className="!bg-white !border !border-gray-200 !rounded-lg !shadow-md"
              aria-label="Canvas zoom controls"
            />

            {/* Mini-map */}
            <MiniMap />
          </ReactFlow>

          {/* Validation Panel */}
          <ValidationPanel
            nodes={nodes}
            edges={edges}
            onNodeFocus={handleNodeFocus}
          />

          {/* Empty state */}
          {nodes.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="text-center p-8 bg-white/80 rounded-xl border border-gray-200 shadow-lg max-w-md">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Start Building Your Funnel
                </h2>
                <p className="text-gray-500">
                  Drag page types from the left sidebar onto this canvas to create your sales funnel.
                  Connect pages by dragging between the handles.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
