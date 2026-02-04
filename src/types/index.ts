import type { Node, Edge } from '@xyflow/react';

// Node type identifiers
export type FunnelNodeType = 
  | 'salesPage' 
  | 'orderPage' 
  | 'upsell' 
  | 'downsell' 
  | 'thankYou';

// Data stored in each funnel node
export type FunnelNodeData = {
  label: string;
  nodeType: FunnelNodeType;
  buttonLabel: string;
  index?: number; // For auto-incrementing (Upsell 1, Upsell 2, etc.)
  [key: string]: unknown; // Index signature for React Flow compatibility
};

// Typed node for React Flow - using Node with generic data
export type FunnelNode = Node<FunnelNodeData>;

// Typed edge for React Flow
export type FunnelEdge = Edge;

// Complete funnel state for persistence
export interface FunnelState {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

// Validation issue types
export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

// Node template for the palette
export interface NodeTemplate {
  type: FunnelNodeType;
  label: string;
  icon: string;
  description: string;
  buttonLabel: string;
  color: string;
}
