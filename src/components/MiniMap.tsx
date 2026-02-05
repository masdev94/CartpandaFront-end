import { memo } from 'react';
import { MiniMap as ReactFlowMiniMap, type MiniMapNodeProps } from '@xyflow/react';
import type { FunnelNodeType } from '../types';
import { nodeTypeColors } from '../theme';

function getNodeColor(node: { type?: string }): string {
  const t = node.type as FunnelNodeType;
  return (nodeTypeColors[t]?.dot ?? '#64748B');
}

/** Render each minimap node as a circle (center of the node bounds, radius = half of smaller dimension) */
function MiniMapCircleNode({ x, y, width, height, color, strokeColor, strokeWidth }: MiniMapNodeProps) {
  const radius = Math.min(width, height) / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={color}
      stroke={strokeColor ?? 'transparent'}
      strokeWidth={strokeWidth ?? 0}
    />
  );
}

function MiniMapComponent() {
  return (
    <ReactFlowMiniMap
      nodeColor={getNodeColor}
      nodeStrokeWidth={2}
      nodeComponent={MiniMapCircleNode}
      pannable
      zoomable
      className="!bg-slate-50 !border !border-slate-200 !rounded-lg !shadow-sm dark:!border-slate-600 dark:!bg-slate-800"
      aria-label="Canvas mini-map"
    />
  );
}

export const MiniMap = memo(MiniMapComponent);
