import { categories } from '../data/content';

export function flattenItems() {
  return categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryId: category.id, categoryLabel: category.label, categoryIcon: category.icon }))
  );
}

export function getCategoryForTopic(id) {
  return categories.find((category) => category.items.some((item) => item.id === id)) ?? null;
}

export function getPrevNextInCategory(id) {
  for (const category of categories) {
    const index = category.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      return {
        category,
        prev: index > 0 ? category.items[index - 1] : null,
        next: index < category.items.length - 1 ? category.items[index + 1] : null,
      };
    }
  }

  return { category: null, prev: null, next: null };
}
