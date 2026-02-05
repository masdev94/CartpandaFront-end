import { memo, useCallback } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { NODE_COLORS, NODE_ICON_COMPONENTS, NODE_TEMPLATES } from '../constants/nodeTemplates';
import type { FunnelNodeType, NodeTemplate } from '../types';

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-600 shadow-sm dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200">
      {children}
    </kbd>
  );
}

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
  isDrawer?: boolean;
  onClose?: () => void;
  onAddNode?: (nodeType: FunnelNodeType) => void;
  onAddNodeAtCenter?: (nodeType: FunnelNodeType) => void;
}

function PaletteItem({
  template,
  onDragStart,
  onTapAdd,
  onAddNodeAtCenter,
  isDrawer,
}: {
  template: NodeTemplate;
  onDragStart: (event: React.DragEvent, nodeType: FunnelNodeType) => void;
  onTapAdd?: (nodeType: FunnelNodeType) => void;
  onAddNodeAtCenter?: (nodeType: FunnelNodeType) => void;
  isDrawer?: boolean;
}) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('application/reactflow', template.type);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(e, template.type);
    },
    [onDragStart, template.type]
  );

  const handleClick = useCallback(() => {
    onTapAdd?.(template.type);
  }, [onTapAdd, template.type]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onAddNodeAtCenter?.(template.type);
      }
    },
    [onAddNodeAtCenter, template.type]
  );

  const colors = NODE_COLORS[template.type];
  const IconComponent = NODE_ICON_COMPONENTS[template.type];
  const cardClass = `
    group flex cursor-grab items-start gap-3 rounded-xl border-2 p-3
    transition-all duration-200 ease-out
    active:cursor-grabbing active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
    touch-manipulation
    shadow-sm hover:shadow-md
    ${colors.bg} ${colors.border}
    dark:bg-slate-800/95 dark:border-slate-600
  `;

  if (isDrawer && onTapAdd) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${cardClass} w-full cursor-pointer text-left min-h-[72px]`}
        aria-label={`Add ${template.label} to canvas`}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm dark:bg-slate-700 dark:text-slate-100"
          aria-hidden
        >
          <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className={`font-semibold text-sm ${colors.text} dark:text-slate-100`}>{template.label}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 line-clamp-2">{template.description}</div>
        </div>
      </button>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onKeyDown={onAddNodeAtCenter ? handleKeyDown : undefined}
      role="button"
      tabIndex={0}
      aria-label={`Add ${template.label}. Drag to canvas or press Enter.`}
      className={`${cardClass} min-h-[72px]`}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm dark:bg-slate-700 dark:text-slate-100"
        aria-hidden
      >
        <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`font-semibold text-sm ${colors.text} dark:text-slate-100`}>{template.label}</div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 line-clamp-2">{template.description}</div>
      </div>
      <span className="shrink-0 text-xs font-medium text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300" aria-hidden>
        Drag →
      </span>
    </div>
  );
}

function SidebarComponent({
  onDragStart,
  isDrawer = false,
  onClose,
  onAddNode,
  onAddNodeAtCenter,
}: SidebarProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-600 px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Add page</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 truncate">
            {isDrawer ? 'Tap to add' : 'Drag to canvas or Enter'}
          </p>
        </div>
        {isDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2.5" role="list">
          {NODE_TEMPLATES.map((t) => (
            <li key={t.type}>
              <PaletteItem
                template={t}
                onDragStart={onDragStart}
                onTapAdd={isDrawer ? onAddNode : undefined}
                onAddNodeAtCenter={!isDrawer ? onAddNodeAtCenter : undefined}
                isDrawer={isDrawer}
              />
            </li>
          ))}
        </ul>
        {!isDrawer && (
          <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-600 dark:bg-slate-800/80" aria-label="How to use">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">How to use</h3>
            <ul className="mt-2.5 space-y-2.5 text-[13px] leading-snug text-slate-700 dark:text-slate-300">
              <li className="flex gap-2">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-400" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Add page</span>
                  <span className="block mt-0.5 text-slate-600 dark:text-slate-300">Drag card to canvas or press <Kbd>Enter</Kbd>.</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-400" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Connect nodes</span>
                  <span className="block mt-0.5 text-slate-600 dark:text-slate-300">From ● (right) to (left) on another node.</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-400" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Pan & zoom</span>
                  <span className="block mt-0.5 text-slate-600 dark:text-slate-300">Drag background to pan; scroll to zoom.</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-400" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Delete & undo</span>
                  <span className="block mt-0.5 text-slate-600 dark:text-slate-300"><Kbd>Del</Kbd> remove; <Kbd>Ctrl+Z</Kbd> / <Kbd>Ctrl+Shift+Z</Kbd> undo/redo.</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-400" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Validate & save</span>
                  <span className="block mt-0.5 text-slate-600 dark:text-slate-300">Use Validation in toolbar; <Kbd>Ctrl+S</Kbd> or Export.</span>
                </span>
              </li>
            </ul>
          </section>
        )}
      </div>
    </>
  );

  if (isDrawer) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          aria-hidden
          onClick={onClose}
        />
        <aside
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-80 md:rounded-none md:border-r md:border-t-0"
          aria-label="Add page — choose a type"
          role="dialog"
          aria-modal="true"
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside
      className="hidden flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:flex md:w-80 md:shrink-0"
      aria-label="Add page — drag to canvas or press Enter"
    >
      {content}
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
