import type { Snippet, SnippetFormData } from '../types';
import { parseSnippetArray } from '../utils/validation';
import { generateSecureId } from '../utils/security';
import { getMMKV } from './mmkvInstance';
import { writeWidgetCache } from './widgetCache';

const SNIPPETS_KEY = 'user_snippets_v1';

function readAll(): Snippet[] {
  const raw = getMMKV().getString(SNIPPETS_KEY);
  return parseSnippetArray(raw);
}

function writeAll(snippets: Snippet[]): void {
  const json = JSON.stringify(snippets);
  getMMKV().set(SNIPPETS_KEY, json);
  writeWidgetCache(json);
}

export const SnippetStorage = {
  getAll(): Snippet[] {
    return readAll();
  },

  async create(form: SnippetFormData): Promise<Snippet> {
    const all = readAll();
    const maxOrder = all.reduce((m, s) => Math.max(m, s.orderIndex), -1);
    const snippet: Snippet = {
      id: await generateSecureId(),
      title: form.title.trim(),
      content: form.content.trim(),
      color: form.color,
      category: form.category.trim() || 'General',
      orderIndex: maxOrder + 1,
      dateCreated: Date.now(),
    };
    writeAll([...all, snippet]);
    return snippet;
  },

  update(id: string, form: SnippetFormData): Snippet | null {
    const all = readAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Snippet = {
      ...all[idx],
      title: form.title.trim(),
      content: form.content.trim(),
      color: form.color,
      category: form.category.trim() || 'General',
    };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  delete(id: string): boolean {
    const all = readAll();
    const filtered = all.filter((s) => s.id !== id);
    if (filtered.length === all.length) return false;
    const reindexed = filtered.map((s, i) => ({ ...s, orderIndex: i }));
    writeAll(reindexed);
    return true;
  },

  reorder(orderedIds: string[]): void {
    const all = readAll();
    const map = new Map(all.map((s) => [s.id, s]));
    const reordered: Snippet[] = [];
    orderedIds.forEach((id, i) => {
      const snippet = map.get(id);
      if (snippet) reordered.push({ ...snippet, orderIndex: i });
    });
    writeAll(reordered);
  },

  clear(): void {
    getMMKV().delete(SNIPPETS_KEY);
  },
};
