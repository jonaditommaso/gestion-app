import { FcParallelTasks, FcBullish, FcSms, FcMoneyTransfer } from 'react-icons/fc';

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

// Helper function to generate items for a category
const generateItems = (featureNum: number, categoryNum: number, itemCount: number = 4): string[] => {
  return Array.from({ length: itemCount }, (_, i) =>
    `feature-${featureNum}-item-${categoryNum}-subitem-${i + 1}`
  );
};

// Helper function to generate categories for a feature
const generateCategories = (featureNum: number, categoryCount: number = 4) => {
  return Array.from({ length: categoryCount }, (_, i) => ({
    name: `feature-${featureNum}-item-name-${i + 1}`,
    items: generateItems(featureNum, i + 1)
  }));
};

// Base feature configuration
const featureConfigs = [
  {
    id: 'workspace',
    icon: FcParallelTasks,
    image: '/tasks-kanban.png',
    gradient: 'from-blue-500/10 to-purple-500/10'
  },
  {
    id: 'sells',
    icon: FcMoneyTransfer,
    image: '/sells-kanban.png',
    gradient: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    id: 'operations',
    icon: FcBullish,
    image: '/billing-dashboard.png',
    gradient: 'from-orange-500/10 to-red-500/10'
  },
  {
    id: 'chatbot',
    icon: FcSms,
    image: '/chatbot-empty.png',
    gradient: 'from-violet-500/10 to-pink-500/10'
  }
];

// Generate features dynamically
export const features: Feature[] = featureConfigs.map((config, index) => ({
  ...config,
  title: `feature-title-${index + 1}`,
  description: `feature-description-${index + 1}`,
  categories: generateCategories(index + 1)
}));