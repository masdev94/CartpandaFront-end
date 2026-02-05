import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFunnelStore } from '../store/funnelStore';
import { validateFunnel } from '../utils/validation';
import CustomNode from './CustomNode';
import NodePalette from './NodePalette';
import Toolbar from './Toolbar';
import ValidationPanel from './ValidationPanel';
import { NodeType } from '../types';

const nodeTypes = {
  customNode: CustomNode,
};

const FunnelCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    exportFunnel,
    importFunnel,
    saveFunnel,
    loadFunnel,
    resetFunnel,
  } = useFunnelStore();

  // Load funnel from localStorage on mount
  useEffect(() => {
    loadFunnel();
  }, [loadFunnel]);

  // Validation
  const validationIssues = useMemo(() => {
    return validateFunnel(nodes, edges);
  }, [nodes, edges]);

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const reactFlowBounds = (event.target as HTMLElement)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      addNode(type, position);
    },
    [addNode]
  );

  // Handle export
  const handleExport = useCallback(() => {
    const json = exportFunnel();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `funnel-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportFunnel]);

  // Handle import
  const handleImport = useCallback(
    (json: string) => {
      importFunnel(json);
    },
    [importFunnel]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveFunnel();
        // Show saved notification
        const notification = document.createElement('div');
        notification.textContent = 'Funnel saved!';
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFunnel]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Toolbar
        onExport={handleExport}
        onImport={handleImport}
        onReset={resetFunnel}
        onSave={saveFunnel}
      />

      <div className="flex-1 flex">
        <NodePalette onAddNode={addNode} />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const nodeData = node.data as { type: NodeType };
                const colorMap: Record<NodeType, string> = {
                  salesPage: '#0ea5e9',
                  orderPage: '#8b5cf6',
                  upsell: '#10b981',
                  downsell: '#f59e0b',
                  thankYou: '#ec4899',
                };
                return colorMap[nodeData.type] || '#gray';
              }}
              pannable
              zoomable
            />
          </ReactFlow>

          <ValidationPanel issues={validationIssues} nodeCount={nodes.length} />
        </div>
      </div>
    </div>
  );
};

export default FunnelCanvas;
