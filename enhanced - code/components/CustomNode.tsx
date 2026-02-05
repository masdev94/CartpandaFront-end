import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../types';
import { NODE_TYPES } from '../constants/nodeTypes';

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as NodeData;
  const config = NODE_TYPES[nodeData.type];

  return (
    <div
      className={`
        relative rounded-lg shadow-lg border-2 p-4 min-w-[200px] min-h-[100px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
      role="article"
      aria-label={`${nodeData.label} node`}
    >
      {/* Input Handle - except for Sales Page which is entry point */}
      {nodeData.type !== 'salesPage' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3"
          aria-label="Connection input"
        />
      )}

      {/* Node Content */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl" role="img" aria-label={config.label}>
          {config.icon}
        </div>
        
        <div className="text-center">
          <h3 className="font-bold text-sm text-gray-800">
            {nodeData.label}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {config.description}
          </p>
        </div>

        <button
          className="
            mt-2 px-4 py-1.5 rounded text-xs font-semibold text-white
            cursor-default
          "
          style={{ backgroundColor: config.color }}
          aria-label={`Button: ${nodeData.buttonLabel}`}
        >
          {nodeData.buttonLabel}
        </button>
      </div>

      {/* Output Handle - except for Thank You which is end point */}
      {nodeData.type !== 'thankYou' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3"
          aria-label="Connection output"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);
