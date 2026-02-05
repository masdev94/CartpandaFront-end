import { Node, Edge } from 'reactflow';
import { ValidationIssue, NodeData } from '../types';

export const validateFunnel = (nodes: Node[], edges: Edge[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    return issues;
  }

  // Check for orphan nodes (nodes with no connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const orphanNodes = nodes.filter(node => !connectedNodeIds.has(node.id) && nodes.length > 1);
  orphanNodes.forEach(node => {
    issues.push({
      nodeId: node.id,
      type: 'warning',
      message: `"${(node.data as NodeData).label}" is not connected to any other nodes`,
    });
  });

  // Check Thank You pages - should have no outgoing edges
  nodes.forEach(node => {
    const nodeData = node.data as NodeData;
    if (nodeData.type === 'thankYou') {
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
      if (outgoingEdges.length > 0) {
        issues.push({
          nodeId: node.id,
          type: 'error',
          message: `"${nodeData.label}" should not have outgoing connections (it's a final page)`,
        });
      }
    }
  });

  // Check Sales Page - should have exactly one outgoing edge
  nodes.forEach(node => {
    const nodeData = node.data as NodeData;
    if (nodeData.type === 'salesPage') {
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
      if (outgoingEdges.length === 0) {
        issues.push({
          nodeId: node.id,
          type: 'warning',
          message: `"${nodeData.label}" should connect to an Order Page`,
        });
      } else if (outgoingEdges.length > 1) {
        issues.push({
          nodeId: node.id,
          type: 'warning',
          message: `"${nodeData.label}" should have only one outgoing connection`,
        });
      }
    }
  });

  // Check for multiple starting points (multiple sales pages with no incoming edges)
  const salesPages = nodes.filter(node => (node.data as NodeData).type === 'salesPage');
  if (salesPages.length > 1) {
    salesPages.forEach(salesPage => {
      const incomingEdges = edges.filter(edge => edge.target === salesPage.id);
      if (incomingEdges.length === 0) {
        issues.push({
          nodeId: salesPage.id,
          type: 'warning',
          message: `Multiple starting points detected. Consider having only one Sales Page as entry.`,
        });
      }
    });
  }

  return issues;
};

export const getNodeValidationStatus = (nodeId: string, issues: ValidationIssue[]): 'valid' | 'warning' | 'error' => {
  const nodeIssues = issues.filter(issue => issue.nodeId === nodeId);
  
  if (nodeIssues.some(issue => issue.type === 'error')) {
    return 'error';
  }
  
  if (nodeIssues.some(issue => issue.type === 'warning')) {
    return 'warning';
  }
  
  return 'valid';
};
