import type { Snippet, SnippetFormData } from '../types';
import {
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_CATEGORY_LENGTH,
  SNIPPET_ACCENT_COLORS,
} from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSnippetForm(data: SnippetFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const title = data.title.trim();
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  const content = data.content.trim();
  if (!content) {
    errors.content = 'Content is required.';
  } else if (content.length > MAX_CONTENT_LENGTH) {
    errors.content = `Content must be ${MAX_CONTENT_LENGTH} characters or fewer.`;
  }

  if (!SNIPPET_ACCENT_COLORS.includes(data.color as typeof SNIPPET_ACCENT_COLORS[number])) {
    errors.color = 'Please select a valid color.';
  }

  const category = data.category.trim();
  if (category.length > MAX_CATEGORY_LENGTH) {
    errors.category = `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Runtime guard that verifies a raw JSON value conforms to the Snippet schema.
 * Used when deserializing untrusted data from MMKV to prevent type confusion.
 */
export function isValidSnippet(value: unknown): value is Snippet {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.orderIndex === 'number' &&
    typeof obj.dateCreated === 'number'
  );
}

export function parseSnippetArray(raw: string | undefined): Snippet[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSnippet);
  } catch {
    return [];
  }
}
