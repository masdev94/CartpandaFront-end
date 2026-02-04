import type { NodeTemplate, FunnelNodeType } from '../types';

// Color palette for each node type
export const NODE_COLORS: Record<FunnelNodeType, { bg: string; border: string; text: string }> = {
  salesPage: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
  },
  orderPage: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
  },
  upsell: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-700',
  },
  downsell: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
  },
  thankYou: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
  },
};

// SVG icons for each node type (simple, accessible)
export const NODE_ICONS: Record<FunnelNodeType, string> = {
  salesPage: '📄',
  orderPage: '🛒',
  upsell: '⬆️',
  downsell: '⬇️',
  thankYou: '✅',
};

// Node templates for the palette
export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'salesPage',
    label: 'Sales Page',
    icon: NODE_ICONS.salesPage,
    description: 'Landing page to present your offer',
    buttonLabel: 'Buy Now',
    color: 'blue',
  },
  {
    type: 'orderPage',
    label: 'Order Page',
    icon: NODE_ICONS.orderPage,
    description: 'Checkout page for payment',
    buttonLabel: 'Complete Order',
    color: 'green',
  },
  {
    type: 'upsell',
    label: 'Upsell',
    icon: NODE_ICONS.upsell,
    description: 'Additional offer after purchase',
    buttonLabel: 'Yes, Add This!',
    color: 'purple',
  },
  {
    type: 'downsell',
    label: 'Downsell',
    icon: NODE_ICONS.downsell,
    description: 'Alternative offer if upsell declined',
    buttonLabel: 'Get This Instead',
    color: 'orange',
  },
  {
    type: 'thankYou',
    label: 'Thank You',
    icon: NODE_ICONS.thankYou,
    description: 'Confirmation page after purchase',
    buttonLabel: 'View Order',
    color: 'emerald',
  },
];

// Default labels for each node type
export const DEFAULT_LABELS: Record<FunnelNodeType, string> = {
  salesPage: 'Sales Page',
  orderPage: 'Order Page',
  upsell: 'Upsell',
  downsell: 'Downsell',
  thankYou: 'Thank You',
};

// Default button labels for each node type
export const DEFAULT_BUTTON_LABELS: Record<FunnelNodeType, string> = {
  salesPage: 'Buy Now',
  orderPage: 'Complete Order',
  upsell: 'Yes, Add This!',
  downsell: 'Get This Instead',
  thankYou: 'View Order',
};

// localStorage key for persisting funnel state
export const STORAGE_KEY = 'cartpanda-funnel-builder-state';
