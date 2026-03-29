import { ALL_CATEGORIES } from "../data/categories";

export const getCategoryIcon = (slug: string): string => {
  return ALL_CATEGORIES.find(c => c.slug === slug)?.icon || '📦';
};

export const getCategoryLabel = (slug: string): string => {
  return ALL_CATEGORIES.find(c => c.slug === slug)?.label || 'Lainnya';
};
