import { useCallback, useState, useEffect, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { FunnelNode, FunnelEdge, FunnelNodeType, FunnelState, FunnelNodeData } from '../types';
import { DEFAULT_LABELS, DEFAULT_BUTTON_LABELS } from '../constants/nodeTemplates';
import { saveFunnelToStorage, loadFunnelFromStorage } from '../utils/storage';
import { isValidConnection } from '../utils/validation';

interface NodeCounters {
  upsell: number;
  downsell: number;
}

function syncCountersFromNodes(counters: { current: NodeCounters }, nodes: FunnelNode[]) {
  nodes.forEach((node) => {
    if (node.data.nodeType === 'upsell' && node.data.index)
      counters.current.upsell = Math.max(counters.current.upsell, node.data.index);
    if (node.data.nodeType === 'downsell' && node.data.index)
      counters.current.downsell = Math.max(counters.current.downsell, node.data.index);
  });
}

export function useFunnelStore() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FunnelNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const countersRef = useRef<NodeCounters>({ upsell: 0, downsell: 0 });
  const [history, setHistory] = useState<FunnelState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  useEffect(() => {
    const saved = loadFunnelFromStorage();
    if (saved?.nodes?.length) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
      syncCountersFromNodes(countersRef, saved.nodes);
      setHistory([saved]);
      setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const state: FunnelState = { nodes, edges };
      saveFunnelToStorage(state);
      if (!isUndoRedoRef.current) {
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(state);
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
      }
      isUndoRedoRef.current = false;
    }
  }, [nodes, edges]);

  const generateLabel = useCallback((nodeType: FunnelNodeType): { label: string; index?: number } => {
    if (nodeType === 'upsell') {
      countersRef.current.upsell++;
      return { label: `Upsell ${countersRef.current.upsell}`, index: countersRef.current.upsell };
    }
    if (nodeType === 'downsell') {
      countersRef.current.downsell++;
      return { label: `Downsell ${countersRef.current.downsell}`, index: countersRef.current.downsell };
    }
    return { label: DEFAULT_LABELS[nodeType] };
  }, []);

  const addNode = useCallback((nodeType: FunnelNodeType, position: { x: number; y: number }) => {
    const { label, index } = generateLabel(nodeType);
    const newNode: FunnelNode = {
      id: nanoid(),
      type: nodeType,
      position,
      data: {
        label,
        nodeType,
        buttonLabel: DEFAULT_BUTTON_LABELS[nodeType],
        index,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [generateLabel, setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    const error = isValidConnection(sourceNode, targetNode, edges);
    if (error) {
      console.warn('Invalid connection:', error);
      return;
    }
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: 'arrowclosed' as const },
    }, eds));
  }, [nodes, edges, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    countersRef.current = { upsell: 0, downsell: 0 };
  }, [setNodes, setEdges]);

  const loadState = useCallback((state: FunnelState) => {
    setNodes(state.nodes);
    setEdges(state.edges);
    countersRef.current = { upsell: 0, downsell: 0 };
    syncCountersFromNodes(countersRef, state.nodes);
  }, [setNodes, setEdges]);

  const getState = useCallback((): FunnelState => {
    return { nodes, edges };
  }, [nodes, edges]);

  const saveFunnel = useCallback(() => {
    const state: FunnelState = { nodes, edges };
    saveFunnelToStorage(state);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    nodes: nodes as FunnelNode[],
    edges: edges as FunnelEdge[],
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    deleteEdge,
    clearCanvas,
    loadState,
    getState,
    saveFunnel,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
