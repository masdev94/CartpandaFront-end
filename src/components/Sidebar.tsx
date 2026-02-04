import { memo, useCallback } from 'react';
import { NODE_TEMPLATES } from '../constants/nodeTemplates';
import type { FunnelNodeType, NodeTemplate } from '../types';
import { NODE_COLORS } from '../constants/nodeTemplates';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
}

function PaletteItem({
  template,
  onDragStart,
}: {
  template: NodeTemplate;
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
}) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('application/reactflow', template.type);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(e, template.type);
    },
    [onDragStart, template.type]
  );

  const colors = NODE_COLORS[template.type];

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      aria-label={`Add ${template.label} to canvas. ${template.description}`}
      className={`
        group flex cursor-grab items-center gap-3 rounded-lg border-2 p-3
        transition-all duration-150 active:cursor-grabbing
        focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2
        ${colors.bg} ${colors.border} border
        hover:shadow-md
      `}
    >
      <span className="text-xl leading-none" aria-hidden>
        {template.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-800">{template.label}</div>
        <div className="text-xs text-slate-500">{template.description}</div>
      </div>
      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">Drag →</span>
    </div>
  );
}

function SidebarComponent({ onDragStart }: SidebarProps) {
  return (
    <aside
      className="flex w-56 flex-col border-r border-slate-200 bg-white"
      aria-label="Page types — drag onto canvas to add"
    >
      <div className="border-b border-slate-200 p-3">
        <h2 className="text-sm font-semibold text-slate-800">Page types</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Drag → drop onto canvas to add.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2" role="list">
          {NODE_TEMPLATES.map((t) => (
            <li key={t.type}>
              <PaletteItem template={t} onDragStart={onDragStart} />
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Tip</p>
          <p className="mt-1">Connect: drag from ● (right handle) to ○ (left handle) on another node.</p>
        </div>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
