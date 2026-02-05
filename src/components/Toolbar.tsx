import { memo, useCallback, useRef, useState } from 'react';
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineArrowUturnLeft,
  HiOutlineArrowUturnRight,
  HiOutlineDocumentCheck,
  HiOutlineEllipsisVertical,
  HiOutlineExclamationTriangle,
  HiOutlineMoon,
  HiOutlinePlus,
  HiOutlineSun,
  HiOutlineTrash,
} from 'react-icons/hi2';
import type { FunnelState } from '../types';
import { exportFunnelAsJson, importFunnelFromJson } from '../utils/storage';

const iconClass = 'h-5 w-5 shrink-0';

interface ToolbarProps {
  onImport: (state: FunnelState) => void;
  onExport: () => FunnelState;
  onSave?: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationOpen: boolean;
  onToggleValidation: () => void;
  validationIssueCount: number;
  onOpenPalette?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const btn =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50';

function ToolbarComponent({
  onImport,
  onExport,
  onSave,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  validationOpen,
  onToggleValidation,
  validationIssueCount,
  onOpenPalette,
  theme = 'light',
  onToggleTheme,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleExport = useCallback(() => {
    const state = onExport();
    exportFunnelAsJson(state, `funnel-${new Date().toISOString().slice(0, 10)}.json`);
  }, [onExport]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const state = await importFunnelFromJson(file);
      if (state) onImport(state);
      else alert('Invalid file. Please choose a funnel JSON export.');
      e.target.value = '';
    },
    [onImport]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) onClear();
  }, [onClear]);

  return (
    <header
      className="flex min-h-[75px] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-4"
      role="toolbar"
      aria-label="Funnel builder toolbar"
    >
      {/* Left: title + undo/redo + theme + Add page (mobile) */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <h1 className="min-w-0 truncate text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          Cartpanda Funnel
        </h1>
        <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`${btn} text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <HiOutlineArrowUturnLeft className={iconClass} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`${btn} text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <HiOutlineArrowUturnRight className={iconClass} />
          </button>
        </div>
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`${btn} shrink-0 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <HiOutlineSun className={iconClass} /> : <HiOutlineMoon className={iconClass} />}
          </button>
        )}
        {onOpenPalette && (
          <button
            type="button"
            onClick={onOpenPalette}
            className={`${btn} shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 md:hidden`}
            aria-label="Add page to canvas"
          >
            <HiOutlinePlus className={iconClass} />
            <span>Add page</span>
          </button>
        )}
      </div>

      {/* Right: Save, Export, Import, Validation, More/Clear — aligned end, can wrap */}
      <div className="flex min-h-[44px] flex-1 flex-wrap items-center justify-end gap-2">
        {/* Desktop: Save, Export, Import */}
        <div className="hidden items-center gap-2 md:flex">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
              aria-label="Save funnel"
              title="Save to localStorage (Ctrl+S)"
            >
              <HiOutlineDocumentCheck className={iconClass} />
              Save
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
            aria-label="Export JSON"
            title="Export JSON"
          >
            <HiOutlineArrowDownTray className={iconClass} />
            Export
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
            aria-label="Import JSON"
            title="Import JSON"
          >
            <HiOutlineArrowUpTray className={iconClass} />
            Import
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleValidation}
          className={`${btn} relative border ${validationOpen ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-200' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
          aria-label="Validation"
          aria-expanded={validationOpen}
          title="Validation"
        >
          <HiOutlineExclamationTriangle className={`${iconClass} shrink-0`} />
          <span className="hidden sm:inline">Validation</span>
          {validationIssueCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
              {validationIssueCount}
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden
        />
        {/* More menu: mobile only — Export, Import, Clear */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={`${btn} border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
            aria-label="More actions"
            aria-expanded={moreOpen}
            title="More actions"
          >
            <HiOutlineEllipsisVertical className={iconClass} />
          </button>
          {moreOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                aria-hidden
                onClick={() => setMoreOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
                {onSave && (
                  <button
                    type="button"
                    className="flex min-h-[44px] w-full items-center gap-2 px-4 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={() => {
                      onSave();
                      setMoreOpen(false);
                    }}
                  >
                    <HiOutlineDocumentCheck className="h-4 w-4 shrink-0" />
                    Save
                  </button>
                )}
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center gap-2 px-4 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => {
                    handleExport();
                    setMoreOpen(false);
                  }}
                >
                  <HiOutlineArrowDownTray className="h-4 w-4 shrink-0" />
                  Export
                </button>
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center gap-2 px-4 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => {
                    handleImportClick();
                    setMoreOpen(false);
                  }}
                >
                  <HiOutlineArrowUpTray className="h-4 w-4 shrink-0" />
                  Import
                </button>
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center gap-2 px-4 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                  onClick={() => {
                    handleClear();
                    setMoreOpen(false);
                  }}
                >
                  <HiOutlineTrash className="h-4 w-4 shrink-0" />
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className={`${btn} hidden border border-slate-300 bg-white text-red-600 hover:bg-red-50 dark:border-slate-600 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30 md:flex`}
          aria-label="Clear canvas"
          title="Clear canvas"
        >
          <HiOutlineTrash className={iconClass} />
          Clear
        </button>
      </div>
    </header>
  );
}

export const Toolbar = memo(ToolbarComponent);
