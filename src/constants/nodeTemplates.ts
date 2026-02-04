import type { NodeTemplate, FunnelNodeType } from '../types';

// Tailwind classes for each node type (used by FunnelNode and Sidebar)
export const NODE_COLORS: Record<FunnelNodeType, { bg: string; border: string; text: string; btn: string }> = {
  salesPage: {
    bg: 'bg-[#EFF6FF]',
    border: 'border-[#3B82F6]',
    text: 'text-[#1D4ED8]',
    btn: 'bg-[#3B82F6] text-white',
  },
  orderPage: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#10B981]',
    text: 'text-[#047857]',
    btn: 'bg-[#10B981] text-white',
  },
  upsell: {
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#8B5CF6]',
    text: 'text-[#5B21B6]',
    btn: 'bg-[#8B5CF6] text-white',
  },
  downsell: {
    bg: 'bg-[#FFF7ED]',
    border: 'border-[#F97316]',
    text: 'text-[#C2410C]',
    btn: 'bg-[#F97316] text-white',
  },
  thankYou: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#059669]',
    text: 'text-[#065F46]',
    btn: 'bg-[#059669] text-white',
  },
};

// Simple icons (emoji kept for speed; could be SVG later)
export const NODE_ICONS: Record<FunnelNodeType, string> = {
  salesPage: '📄',
  orderPage: '🛒',
  upsell: '⬆️',
  downsell: '⬇️',
  thankYou: '✅',
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  { type: 'salesPage', label: 'Sales Page', icon: NODE_ICONS.salesPage, description: 'Landing page for your offer', buttonLabel: 'Buy Now', color: 'blue' },
  { type: 'orderPage', label: 'Order Page', icon: NODE_ICONS.orderPage, description: 'Checkout and payment', buttonLabel: 'Complete Order', color: 'green' },
  { type: 'upsell', label: 'Upsell', icon: NODE_ICONS.upsell, description: 'Extra offer after purchase', buttonLabel: 'Yes, Add This!', color: 'purple' },
  { type: 'downsell', label: 'Downsell', icon: NODE_ICONS.downsell, description: 'Alternative if they decline', buttonLabel: 'Get This Instead', color: 'orange' },
  { type: 'thankYou', label: 'Thank You', icon: NODE_ICONS.thankYou, description: 'Confirmation page', buttonLabel: 'View Order', color: 'emerald' },
];

export const DEFAULT_LABELS: Record<FunnelNodeType, string> = {
  salesPage: 'Sales Page',
  orderPage: 'Order Page',
  upsell: 'Upsell',
  downsell: 'Downsell',
  thankYou: 'Thank You',
};

export const DEFAULT_BUTTON_LABELS: Record<FunnelNodeType, string> = {
  salesPage: 'Buy Now',
  orderPage: 'Complete Order',
  upsell: 'Yes, Add This!',
  downsell: 'Get This Instead',
  thankYou: 'View Order',
};

export const STORAGE_KEY = 'cartpanda-funnel-builder-state';
