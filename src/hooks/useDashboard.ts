import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardData, RangeKey } from "../types";
import { fetchDashboard, isAbortError } from "../lib/api";

interface State {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook de carga con cancelación, reintentos y estado de error.
 * Evita el clásico "setState después de desmontar" y las respuestas fuera de orden.
 */
export function useDashboard(range: RangeKey) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;

    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    fetchDashboard(range, current.signal)
      .then((data) => {
        if (!current.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      });

    return () => current.abort();
  }, [range, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
