import type { FunnelNode, FunnelEdge, ValidationIssue, FunnelNodeData } from '../types';
import type { Node, Edge } from '@xyflow/react';

// Type for nodes that can be validated - either FunnelNode or generic Node with FunnelNodeData
type ValidatableNode = FunnelNode | Node<FunnelNodeData>;

/**
 * Validates the funnel structure and returns any issues found.
 * Rules:
 * 1. "Thank You" nodes should have no outgoing edges
 * 2. "Sales Page" should have exactly one outgoing edge (to Order Page) - warn if invalid
 * 3. Orphan nodes (no connections) are flagged
 */
export function validateFunnel(nodes: ValidatableNode[], edges: (FunnelEdge | Edge)[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Create maps for quick lookups
  const outgoingEdges = new Map<string, FunnelEdge[]>();
  const incomingEdges = new Map<string, FunnelEdge[]>();
  
  edges.forEach(edge => {
    // Outgoing
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, []);
    }
    outgoingEdges.get(edge.source)!.push(edge);
    
    // Incoming
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    incomingEdges.get(edge.target)!.push(edge);
  });
  
  nodes.forEach(node => {
    const nodeOutgoing = outgoingEdges.get(node.id) || [];
    const nodeIncoming = incomingEdges.get(node.id) || [];
    const nodeType = node.data.nodeType;
    
    // Rule 1: Thank You nodes should have no outgoing edges
    if (nodeType === 'thankYou' && nodeOutgoing.length > 0) {
      issues.push({
        id: `thank-you-outgoing-${node.id}`,
        type: 'error',
        message: `"${node.data.label}" should not have outgoing connections`,
        nodeId: node.id,
      });
    }
    
    // Rule 2: Sales Page should have one outgoing edge (warning)
    if (nodeType === 'salesPage') {
      if (nodeOutgoing.length === 0) {
        issues.push({
          id: `sales-no-outgoing-${node.id}`,
          type: 'warning',
          message: `"${node.data.label}" should connect to an Order Page`,
          nodeId: node.id,
        });
      } else if (nodeOutgoing.length > 1) {
        issues.push({
          id: `sales-multiple-outgoing-${node.id}`,
          type: 'warning',
          message: `"${node.data.label}" has multiple outgoing connections (typically should have one)`,
          nodeId: node.id,
        });
      }
    }
    
    // Rule 3: Check for orphan nodes (no connections at all)
    if (nodeOutgoing.length === 0 && nodeIncoming.length === 0 && nodes.length > 1) {
      issues.push({
        id: `orphan-${node.id}`,
        type: 'warning',
        message: `"${node.data.label}" is not connected to any other node`,
        nodeId: node.id,
      });
    }
  });
  
  return issues;
}

/**
 * Checks if a connection is valid based on funnel rules.
 * Returns null if valid, or an error message if invalid.
 */
export function isValidConnection(
  sourceNode: ValidatableNode | undefined,
  targetNode: ValidatableNode | undefined,
  existingEdges: (FunnelEdge | Edge)[]
): string | null {
  if (!sourceNode || !targetNode) {
    return 'Invalid nodes';
  }
  
  // Prevent self-connection
  if (sourceNode.id === targetNode.id) {
    return 'Cannot connect a node to itself';
  }
  
  // Prevent duplicate connections
  const existingConnection = existingEdges.find(
    edge => edge.source === sourceNode.id && edge.target === targetNode.id
  );
  if (existingConnection) {
    return 'Connection already exists';
  }
  
  // Thank You nodes cannot have outgoing edges
  if (sourceNode.data.nodeType === 'thankYou') {
    return 'Thank You pages cannot have outgoing connections';
  }
  
  return null;
}

/**
 * Counts issues by type
 */
export function countIssues(issues: ValidationIssue[]): { errors: number; warnings: number } {
  return issues.reduce(
    (acc, issue) => {
      if (issue.type === 'error') {
        acc.errors++;
      } else {
        acc.warnings++;
      }
      return acc;
    },
    { errors: 0, warnings: 0 }
  );
}
