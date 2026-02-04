import { memo, useCallback } from 'react';
import { NODE_TEMPLATES } from '../constants/nodeTemplates';
import type { FunnelNodeType, NodeTemplate } from '../types';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
}

interface PaletteItemProps {
  template: NodeTemplate;
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
}

/**
 * Individual draggable item in the palette
 */
const PaletteItem = memo(function PaletteItem({ template, onDragStart }: PaletteItemProps) {
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      onDragStart(event, template.type);
    },
    [onDragStart, template.type]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Allow keyboard users to "grab" the item with Enter/Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // For keyboard accessibility, we could implement a click-to-place mode
        // For now, we just focus the element
      }
    },
    []
  );

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
    green: 'border-green-300 bg-green-50 hover:bg-green-100',
    purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
    orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
    emerald: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100',
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Drag ${template.label} node to canvas. ${template.description}`}
      className={`
        p-3 rounded-lg border-2 cursor-grab
        ${colorClasses[template.color]}
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:cursor-grabbing
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" role="img" aria-hidden="true">
          {template.icon}
        </span>
        <span className="font-medium text-sm text-gray-800">
          {template.label}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        {template.description}
      </p>
    </div>
  );
});

/**
 * Sidebar palette containing draggable node templates.
 * Users drag items from here onto the canvas to create new nodes.
 */
function SidebarComponent({ onDragStart }: SidebarProps) {
  return (
    <aside
      className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto"
      aria-label="Node palette"
    >
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
        Page Types
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Drag and drop pages onto the canvas to build your funnel
      </p>
      
      <div className="space-y-3" role="list" aria-label="Available node types">
        {NODE_TEMPLATES.map((template) => (
          <PaletteItem
            key={template.type}
            template={template}
            onDragStart={onDragStart}
          />
        ))}
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Drag pages to the canvas</li>
          <li>• Connect pages by dragging from handles</li>
          <li>• Pan canvas by dragging background</li>
          <li>• Use scroll wheel to zoom</li>
        </ul>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
