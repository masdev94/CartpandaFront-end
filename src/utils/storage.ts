import type { FunnelState } from '../types';
import { STORAGE_KEY } from '../constants/nodeTemplates';

/**
 * Saves funnel state to localStorage
 */
export function saveFunnelToStorage(state: FunnelState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save funnel to localStorage:', error);
  }
}

/**
 * Loads funnel state from localStorage
 */
export function loadFunnelFromStorage(): FunnelState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as FunnelState;
  } catch (error) {
    console.error('Failed to load funnel from localStorage:', error);
    return null;
  }
}

/**
 * Clears funnel state from localStorage
 */
export function clearFunnelStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear funnel from localStorage:', error);
  }
}

/**
 * Exports funnel state as a JSON file download
 */
export function exportFunnelAsJson(state: FunnelState, filename = 'funnel-export.json'): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports funnel state from a JSON file
 * Returns the parsed state or null if invalid
 */
export function importFunnelFromJson(file: File): Promise<FunnelState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const state = JSON.parse(json) as FunnelState;
        
        // Basic validation
        if (!state.nodes || !state.edges || !Array.isArray(state.nodes) || !Array.isArray(state.edges)) {
          console.error('Invalid funnel JSON structure');
          resolve(null);
          return;
        }
        
        resolve(state);
      } catch (error) {
        console.error('Failed to parse funnel JSON:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('Failed to read file');
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}
