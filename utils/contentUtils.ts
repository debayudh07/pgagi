/**
 * Utility functions for content management
 */

import { ContentItem } from '../types';

/**
 * Ensures unique IDs for content items to prevent React key conflicts
 * @param items - Array of content items
 * @param prefix - Optional prefix for the unique ID
 * @returns Array of content items with guaranteed unique IDs
 */
export function ensureUniqueIds(items: ContentItem[], prefix?: string): ContentItem[] {
  const seenIds = new Set<string>();
  const uniqueItems: ContentItem[] = [];

  items.forEach((item, index) => {
    let uniqueId = item.id;
    
    // If we've seen this ID before, make it unique
    if (seenIds.has(item.id)) {
      uniqueId = prefix ? `${prefix}-${item.id}-${index}` : `${item.id}-${index}`;
    }
    
    // If the generated ID is still not unique (edge case), add timestamp
    if (seenIds.has(uniqueId)) {
      uniqueId = `${uniqueId}-${Date.now()}`;
    }
    
    seenIds.add(uniqueId);
    uniqueItems.push({ ...item, id: uniqueId });
  });

  return uniqueItems;
}

/**
 * Combines multiple arrays of content items while ensuring unique IDs
 * @param itemArrays - Array of content item arrays with optional prefixes
 * @returns Combined array with unique IDs
 */
export function combineWithUniqueIds(
  itemArrays: Array<{ items: ContentItem[]; prefix?: string }>
): ContentItem[] {
  const seenIds = new Set<string>();
  const combinedItems: ContentItem[] = [];

  itemArrays.forEach(({ items, prefix }) => {
    items.forEach((item, index) => {
      let uniqueId = item.id;
      
      // Always add prefix if provided
      if (prefix) {
        uniqueId = `${prefix}-${item.id}`;
      }
      
      // If ID is still not unique, add index
      if (seenIds.has(uniqueId)) {
        uniqueId = `${uniqueId}-${index}`;
      }
      
      // Final fallback with timestamp
      if (seenIds.has(uniqueId)) {
        uniqueId = `${uniqueId}-${Date.now()}`;
      }
      
      seenIds.add(uniqueId);
      combinedItems.push({ ...item, id: uniqueId });
    });
  });

  return combinedItems;
}

/**
 * Removes duplicates from content items based on original TMDB ID
 * (ignoring prefixes added for uniqueness)
 * @param items - Array of content items
 * @returns Array without duplicates based on original ID
 */
export function removeDuplicatesByOriginalId(items: ContentItem[]): ContentItem[] {
  const seenOriginalIds = new Set<string>();
  const uniqueItems: ContentItem[] = [];

  items.forEach((item) => {
    // Extract original ID by removing common prefixes
    const originalId = item.id.replace(/^(popular|trending|toprated|nowplaying|tv|search)-/, '');
    
    if (!seenOriginalIds.has(originalId)) {
      seenOriginalIds.add(originalId);
      uniqueItems.push(item);
    }
  });

  return uniqueItems;
}

/**
 * Shuffles an array while maintaining unique IDs
 * @param items - Array to shuffle
 * @returns Shuffled array
 */
export function shuffleWithUniqueIds(items: ContentItem[]): ContentItem[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return ensureUniqueIds(shuffled, 'shuffled');
}
