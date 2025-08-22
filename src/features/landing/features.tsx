import { FcParallelTasks, FcAddDatabase, FcBullish } from 'react-icons/fc';

interface Feature {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  image: string;
  categories: {
    name: string;
    items: string[];
  }[];
  gradient: string;
}

export const features: Feature[] = [
  {
    id: 'workspace',
    icon: FcParallelTasks,
    title: 'feature-title-1',
    description: 'feature-description-1',
    image: '/present-workspaces.png',
    categories: [
      {
        name: 'feature-1-item-name-1',
        items: [
          'feature-1-item-1-subitem-1',
          'feature-1-item-1-subitem-2',
          'feature-1-item-1-subitem-3',
          'feature-1-item-1-subitem-4'
        ]
      },
      {
        name: 'feature-1-item-name-2',
        items: [
          'feature-1-item-2-subitem-1',
          'feature-1-item-2-subitem-2',
          'feature-1-item-2-subitem-3',
          'feature-1-item-2-subitem-4'
        ]
      },
      {
        name: 'feature-1-item-name-3',
        items: [
          'feature-1-item-3-subitem-1',
          'feature-1-item-3-subitem-2',
          'feature-1-item-3-subitem-3',
          'feature-1-item-3-subitem-4'
        ]
      },
      {
        name: 'feature-1-item-name-4',
        items: [
          'feature-1-item-4-subitem-1',
          'feature-1-item-4-subitem-2',
          'feature-1-item-4-subitem-3',
          'feature-1-item-4-subitem-4',
        ]
      }
    ],
    gradient: 'from-blue-500/10 to-purple-500/10'
  },
  {
    id: 'cloud-storage',
    icon: FcAddDatabase,
    title: 'feature-title-2',
    description: 'feature-description-2',
    image: '/present-records.png',
    categories: [
      {
        name: 'feature-2-item-name-1',
        items: [
          'feature-2-item-1-subitem-1',
          'feature-2-item-1-subitem-2',
          'feature-2-item-1-subitem-3',
          'feature-2-item-1-subitem-4'
        ]
      },
      {
        name: 'feature-2-item-name-2',
        items: [
          'feature-2-item-2-subitem-1',
          'feature-2-item-2-subitem-2',
          'feature-2-item-2-subitem-3',
          'feature-2-item-2-subitem-4'
        ]
      },
      {
        name: 'feature-2-item-name-3',
        items: [
          'feature-2-item-3-subitem-1',
          'feature-2-item-3-subitem-2',
          'feature-2-item-3-subitem-3',
          'feature-2-item-3-subitem-4'
        ]
      },
      {
        name: 'feature-2-item-name-4',
        items: [
          'feature-2-item-4-subitem-1',
          'feature-2-item-4-subitem-2',
          'feature-2-item-4-subitem-3',
          'feature-2-item-4-subitem-4'
        ]
      }
    ],
    gradient: 'from-emerald-500/10 to-blue-500/10'
  },
  {
    id: 'operations',
    icon: FcBullish,
    title: 'feature-title-3',
    description: 'feature-description-3',
    image: '/present-billing.png',
    categories: [
      {
        name: 'feature-3-item-name-1',
        items: [
          'feature-3-item-1-subitem-1',
          'feature-3-item-1-subitem-2',
          'feature-3-item-1-subitem-3',
          'feature-3-item-1-subitem-4'
        ]
      },
      {
        name: 'feature-3-item-name-2',
        items: [
          'feature-3-item-2-subitem-1',
          'feature-3-item-2-subitem-2',
          'feature-3-item-2-subitem-3',
          'feature-3-item-2-subitem-4'
        ]
      },
      {
        name: 'feature-3-item-name-3',
        items: [
          'feature-3-item-3-subitem-1',
          'feature-3-item-3-subitem-2',
          'feature-3-item-3-subitem-3',
          'feature-3-item-3-subitem-4'
        ]
      },
      {
        name: 'feature-3-item-name-4',
        items: [
          'feature-3-item-4-subitem-1',
          'feature-3-item-4-subitem-2',
          'feature-3-item-4-subitem-3',
          'feature-3-item-4-subitem-4'
        ]
      }
    ],
    gradient: 'from-orange-500/10 to-red-500/10'
  }
];