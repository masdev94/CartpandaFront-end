import { NodeTypeConfig, NodeType } from '../types';

export const NODE_TYPES: Record<NodeType, NodeTypeConfig> = {
  salesPage: {
    type: 'salesPage',
    label: 'Sales Page',
    icon: '🛍️',
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    defaultButtonLabel: 'Buy Now',
    description: 'Entry point for your funnel',
  },
  orderPage: {
    type: 'orderPage',
    label: 'Order Page',
    icon: '📝',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    borderColor: '#8b5cf6',
    defaultButtonLabel: 'Complete Order',
    description: 'Checkout and order form',
  },
  upsell: {
    type: 'upsell',
    label: 'Upsell',
    icon: '⬆️',
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#10b981',
    defaultButtonLabel: 'Yes, Add This!',
    description: 'Additional product offer',
  },
  downsell: {
    type: 'downsell',
    label: 'Downsell',
    icon: '⬇️',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
    defaultButtonLabel: 'Get Discount',
    description: 'Alternative lower-priced offer',
  },
  thankYou: {
    type: 'thankYou',
    label: 'Thank You',
    icon: '✅',
    color: '#ec4899',
    bgColor: '#fce7f3',
    borderColor: '#ec4899',
    defaultButtonLabel: 'Continue',
    description: 'Final confirmation page',
  },
};

export const STORAGE_KEY = 'upsell-funnel-state';

export const DEFAULT_NODE_WIDTH = 200;
export const DEFAULT_NODE_HEIGHT = 100;
