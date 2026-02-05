import React from 'react';
import { NodeType } from '../types';
import { NODE_TYPES } from '../constants/nodeTypes';
import { FiPlus } from 'react-icons/fi';

interface NodePaletteProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes: NodeType[] = ['salesPage', 'orderPage', 'upsell', 'downsell', 'thankYou'];

  return (
    <div className="w-64 bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiPlus /> Node Palette
      </h2>
      
      <p className="text-sm text-gray-400 mb-4">
        Drag nodes onto the canvas to build your funnel
      </p>

      <div className="space-y-3">
        {nodeTypes.map((type) => {
          const config = NODE_TYPES[type];
          
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              className="
                p-4 rounded-lg cursor-grab active:cursor-grabbing
                border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg
              "
              style={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              }}
              role="button"
              tabIndex={0}
              aria-label={`Add ${config.label} node`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Add node to center of canvas when using keyboard
                  onAddNode(type, { x: 250, y: 250 });
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl" role="img" aria-label={config.label}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {config.label}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">💡 Tips</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag nodes to canvas</li>
          <li>• Connect using handles</li>
          <li>• Delete with Delete/Backspace</li>
          <li>• Pan by dragging canvas</li>
          <li>• Scroll to zoom</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette;
