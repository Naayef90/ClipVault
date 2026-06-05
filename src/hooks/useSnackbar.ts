import { useCallback, useState } from 'react';
import type { SnackbarMessage, SnackbarSeverity } from '../types';
import { generateSecureId } from '../utils/security';

export function useSnackbar() {
  const [queue, setQueue] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback(
    async (message: string, severity: SnackbarSeverity = 'info') => {
      const id = await generateSecureId();
      setQueue((prev) => [...prev, { id, message, severity }]);
    },
    [],
  );

  const dismissSnackbar = useCallback((id: string) => {
    setQueue((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const current = queue[0] ?? null;

  return { current, showSnackbar, dismissSnackbar };
}
