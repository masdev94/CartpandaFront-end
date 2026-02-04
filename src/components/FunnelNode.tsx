import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FunnelNodeData } from '../types';
import { NODE_COLORS, NODE_ICONS } from '../constants/nodeTemplates';

// Use a generic NodeProps with our data type
type FunnelNodeComponentProps = NodeProps & {
  data: FunnelNodeData;
};

/**
 * Custom node component for the funnel builder.
 * Displays the node type icon, label, and a button preview.
 */
function FunnelNodeComponent({ data, selected }: FunnelNodeComponentProps) {
  const nodeType = data.nodeType;
  const colors = NODE_COLORS[nodeType];
  const icon = NODE_ICONS[nodeType];
  const isThankYou = nodeType === 'thankYou';
  
  // Prevent drag when clicking on the button preview
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  
  return (
    <div
      className={`
        relative min-w-[180px] rounded-lg border-2 shadow-md
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-shadow duration-200
      `}
      role="button"
      aria-label={`${data.label} node`}
      tabIndex={0}
    >
      {/* Input Handle (top) - not for Sales Page typically, but we allow it */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-white"
        aria-label="Connect from another node"
      />
      
      {/* Node Content */}
      <div className="p-3">
        {/* Header with icon and label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg" role="img" aria-hidden="true">
            {icon}
          </span>
          <h3 className={`font-semibold text-sm ${colors.text}`}>
            {data.label}
          </h3>
        </div>
        
        {/* Thumbnail placeholder */}
        <div className="bg-white/50 rounded border border-gray-200 h-16 mb-2 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Page Preview</span>
        </div>
        
        {/* Button preview */}
        <button
          onClick={handleButtonClick}
          className={`
            w-full py-1.5 px-3 rounded text-xs font-medium
            ${nodeType === 'salesPage' ? 'bg-blue-500 text-white' : ''}
            ${nodeType === 'orderPage' ? 'bg-green-500 text-white' : ''}
            ${nodeType === 'upsell' ? 'bg-purple-500 text-white' : ''}
            ${nodeType === 'downsell' ? 'bg-orange-500 text-white' : ''}
            ${nodeType === 'thankYou' ? 'bg-emerald-500 text-white' : ''}
            cursor-default
          `}
          tabIndex={-1}
          aria-label={`Button: ${data.buttonLabel}`}
        >
          {data.buttonLabel}
        </button>
      </div>
      
      {/* Output Handle (bottom) - not for Thank You pages */}
      {!isThankYou && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="source"
          className="!w-3 !h-3 !bg-gray-500 !border-2 !border-white"
          aria-label="Connect to another node"
        />
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const FunnelNode = memo(FunnelNodeComponent);
