import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type ReactFlowInstance,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FunnelNode } from './FunnelNode';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { ValidationPanel } from './ValidationPanel';
import { MiniMap } from './MiniMap';
import { useFunnelStore } from '../hooks/useFunnelStore';
import { validateFunnel, isValidConnection } from '../utils/validation';
import type { FunnelNodeType } from '../types';

const nodeTypes = {
  salesPage: FunnelNode,
  orderPage: FunnelNode,
  upsell: FunnelNode,
  downsell: FunnelNode,
  thankYou: FunnelNode,
};

const VALID_NODE_TYPES: FunnelNodeType[] = ['salesPage', 'orderPage', 'upsell', 'downsell', 'thankYou'];
const EDGE_STROKE = '#059669';

export function FunnelBuilder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    saveFunnel,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFunnelStore();

  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('funnel-builder-theme') as 'light' | 'dark')) || 'light'
  );

  const showToast = useCallback((message: string, type: 'success' | 'error', duration = type === 'error' ? 3000 : 2000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('funnel-builder-theme', theme);
  }, [theme]);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

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
      e.stopPropagation();
      setIsDraggingOver(false);
      const rawType = e.dataTransfer.getData('application/reactflow');
      const nodeType = VALID_NODE_TYPES.includes(rawType as FunnelNodeType) ? (rawType as FunnelNodeType) : null;
      if (!nodeType || !flowRef.current) return;
      let position: { x: number; y: number };
      try {
        position = flowRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      } catch {
        return;
      }
      if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
      setTimeout(() => addNode(nodeType, position), 0);
    },
    [addNode]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowRef.current = instance;
  }, []);

  const addNodeAtCenter = useCallback(
    (nodeType: FunnelNodeType) => {
      if (!flowRef.current || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = flowRef.current.screenToFlowPosition({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      });
      addNode(nodeType, position);
      setPaletteDrawerOpen(false);
    },
    [addNode]
  );

  const handleNodeFocus = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && flowRef.current) {
      flowRef.current.setCenter(node.position.x + 100, node.position.y + 50, {
        zoom: 1.2,
        duration: 400,
      });
    }
  }, [nodes]);

  const isValidConnectionForFlow = useCallback(
    (connection: Connection | Edge) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      return isValidConnection(sourceNode, targetNode, edges) === null;
    },
    [nodes, edges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      const error = isValidConnection(sourceNode, targetNode, edges);
      if (error) {
        showToast(error, 'error');
        return;
      }
      onConnect(connection);
    },
    [nodes, edges, onConnect, showToast]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFunnel();
        showToast('Funnel saved!', 'success');
      }
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
  }, [undo, redo, saveFunnel, showToast]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-900">
      <Toolbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onImport={loadState}
        onExport={getState}
        onSave={() => { saveFunnel(); showToast('Funnel saved!', 'success'); }}
        onClear={clearCanvas}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        validationOpen={validationOpen}
        onToggleValidation={() => setValidationOpen((o) => !o)}
        validationIssueCount={issues.length}
        onOpenPalette={() => setPaletteDrawerOpen(true)}
      />

      <div className="funnel-container relative flex min-h-0 flex-1 flex-row overflow-hidden">
        {validationOpen && (
          <button
            type="button"
            aria-label="Close validation"
            className="absolute inset-0 z-10 cursor-default"
            onClick={() => setValidationOpen(false)}
          />
        )}
        <Sidebar
          onDragStart={handleDragStart}
          onAddNodeAtCenter={addNodeAtCenter}
        />
        {paletteDrawerOpen && (
          <Sidebar
            onDragStart={handleDragStart}
            isDrawer
            onClose={() => setPaletteDrawerOpen(false)}
            onAddNode={addNodeAtCenter}
          />
        )}
        <main
          id="main-canvas"
          ref={wrapperRef}
          className="funnel-canvas relative min-h-0 flex-1"
          role="application"
          aria-label="Funnel canvas"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ReactFlow
            colorMode={theme}
            nodes={nodesWithWarnings as Node[]}
            edges={edges as Edge[]}
            onNodesChange={onNodesChange as never}
            onEdgesChange={onEdgesChange as never}
            onConnect={handleConnect}
            isValidConnection={isValidConnectionForFlow}
            nodesConnectable
            elementsSelectable
            onInit={onInit}
            onDragOver={handleDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              markerEnd: { type: 'arrowclosed' as const },
              style: { stroke: EDGE_STROKE, strokeWidth: 2.5 },
            }}
            connectionLineStyle={{ stroke: EDGE_STROKE, strokeWidth: 2.5 }}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode={['Shift']}
            multiSelectionKeyCode={['Control', 'Meta']}
            snapToGrid
            snapGrid={[20, 20]}
            panOnScroll={false}
            zoomOnScroll
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Lines} gap={30} size={1} lineWidth={0.75} color="#94a3b8" />
            <Controls
              showInteractive={false}
              className="!rounded-lg !border !border-slate-200 !bg-white !shadow-sm dark:!border-slate-600 dark:!bg-slate-800"
              aria-label="Zoom"
            />
            <MiniMap />
          </ReactFlow>

          {isDraggingOver && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 dark:border-indigo-400"
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
            onClose={() => setValidationOpen(false)}
          />

          {isEmpty && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none px-4"
              aria-hidden
            >
              <div className="w-full max-w-sm rounded-xl border-2 border-dashed border-slate-300 bg-white/95 px-6 py-6 text-center shadow-sm dark:border-slate-500 dark:bg-slate-800 dark:shadow-xl dark:shadow-black/20">
                <p className="text-base font-medium text-slate-700 dark:text-slate-100">No pages yet</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300 md:block hidden">
                  Drag a page type from the left sidebar and drop it here to start your funnel.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300 md:hidden">
                  Tap &quot;Add page&quot; above, then choose a page type to add to the canvas.
                </p>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-400">
                  Pan: drag background. Connect: drag from the right dot on one card to the left dot on another.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'error' ? 'bg-amber-600' : 'bg-emerald-600'}`}
          role="status"
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
