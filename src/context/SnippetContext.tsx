import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Snippet, SnippetFormData } from '../types';
import { SnippetStorage } from '../storage/SnippetStorage';
import { syncWidgetData } from '../services/WidgetBridge';

interface SnippetContextValue {
  snippets: Snippet[];
  isLoading: boolean;
  addSnippet: (form: SnippetFormData) => Promise<Snippet>;
  updateSnippet: (id: string, form: SnippetFormData) => Snippet | null;
  deleteSnippet: (id: string) => void;
  reorderSnippets: (orderedIds: string[]) => void;
}

const SnippetContext = createContext<SnippetContextValue | null>(null);

export function SnippetProvider({ children }: { children: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    const all = SnippetStorage.getAll().sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    if (mounted.current) {
      setSnippets(all);
      setIsLoading(false);
      // Sync initial data to widget on app launch
      void syncWidgetData(all);
    }
    return () => {
      mounted.current = false;
    };
  }, []);

  const addSnippet = useCallback(async (form: SnippetFormData): Promise<Snippet> => {
    const created = await SnippetStorage.create(form);
    setSnippets((prev) => {
      const next = [...prev, created].sort((a, b) => a.orderIndex - b.orderIndex);
      void syncWidgetData(next);
      return next;
    });
    return created;
  }, []);

  const updateSnippet = useCallback(
    (id: string, form: SnippetFormData): Snippet | null => {
      const updated = SnippetStorage.update(id, form);
      if (!updated) return null;
      setSnippets((prev) => {
        const next = prev.map((s) => (s.id === id ? updated : s));
        void syncWidgetData(next);
        return next;
      });
      return updated;
    },
    [],
  );

  const deleteSnippet = useCallback((id: string): void => {
    SnippetStorage.delete(id);
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      void syncWidgetData(next);
      return next;
    });
  }, []);

  const reorderSnippets = useCallback((orderedIds: string[]): void => {
    SnippetStorage.reorder(orderedIds);
    setSnippets((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      return orderedIds
        .map((id, i) => {
          const s = map.get(id);
          return s ? { ...s, orderIndex: i } : null;
        })
        .filter((s): s is Snippet => s !== null);
    });
  }, []);

  const value = useMemo<SnippetContextValue>(
    () => ({
      snippets,
      isLoading,
      addSnippet,
      updateSnippet,
      deleteSnippet,
      reorderSnippets,
    }),
    [snippets, isLoading, addSnippet, updateSnippet, deleteSnippet, reorderSnippets],
  );

  return (
    <SnippetContext.Provider value={value}>{children}</SnippetContext.Provider>
  );
}

export function useSnippets(): SnippetContextValue {
  const ctx = useContext(SnippetContext);
  if (!ctx) throw new Error('useSnippets must be used within SnippetProvider');
  return ctx;
}
