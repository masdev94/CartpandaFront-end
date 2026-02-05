import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
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
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

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

  const [toast, setToast] = useState<string | null>(null);
  const [validationNotification, setValidationNotification] = useState<{ message: string; type: 'issues' | 'ok' | 'empty' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('funnel-builder-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('funnel-builder-theme', theme);
  }, [theme]);

  const issues = useMemo(() => validateFunnel(nodes, edges), [nodes, edges]);
  const prevIssuesLengthRef = useRef(0);

  /* Show notification when Validation panel is opened: summary at top-center + panel shows details (same time) */
  useEffect(() => {
    if (!validationOpen) {
      setValidationNotification(null);
      return;
    }
    const type = issues.length > 0 ? 'issues' : nodes.length > 0 ? 'ok' : 'empty';
    const message = issues.length > 0
      ? `${issues.length} validation issue(s) found — see panel for details`
      : nodes.length > 0
        ? 'Funnel rules OK'
        : 'Add pages to validate.';
    setValidationNotification({ message, type });
    const t = setTimeout(() => setValidationNotification(null), 3000);
    return () => clearTimeout(t);
  }, [validationOpen]);

  /* Show notification when issues first appear (initial issues), so user sees summary without opening panel */
  useEffect(() => {
    if (issues.length === 0) {
      prevIssuesLengthRef.current = 0;
      return;
    }
    if (prevIssuesLengthRef.current > 0) return; // already had issues, don't re-notify on every change
    prevIssuesLengthRef.current = issues.length;
    setValidationNotification({
      message: `${issues.length} validation issue(s) found — click Validation for details`,
      type: 'issues',
    });
    const t = setTimeout(() => setValidationNotification(null), 3000);
    return () => clearTimeout(t);
  }, [issues.length]);
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

  /** Add node at viewport center (for mobile tap-to-add). */
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFunnel();
        setToast('Funnel saved!');
        setTimeout(() => setToast(null), 2000);
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
  }, [undo, redo, saveFunnel]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-900">
      <Toolbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onImport={loadState}
        onExport={getState}
        onSave={() => {
          saveFunnel();
          setToast('Funnel saved!');
          setTimeout(() => setToast(null), 2000);
        }}
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

      <div className="relative flex flex-1 overflow-hidden">
        {/* Click-outside backdrop: closes Validation panel when clicking canvas/sidebar */}
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
          className="relative flex-1"
          role="application"
          aria-label="Funnel canvas"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
            panOnScroll={false}
            zoomOnScroll
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="[--bg-dots:theme(colors.slate.300)] dark:[--bg-dots:theme(colors.slate.600)]" />
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
                  Pan: drag background. Connect: drag from ● (right) to ○ (left).
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast notification (e.g. after Save or Ctrl+S) */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      {/* Validation notification: top-center, auto-close after 3s */}
      {validationNotification && (
        <div
          className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          role="status"
          aria-live="polite"
        >
          {validationNotification.type === 'issues' ? (
            <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
          ) : validationNotification.type === 'ok' ? (
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
          ) : null}
          <span>{validationNotification.message}</span>
        </div>
      )}
    </div>
  );
}
