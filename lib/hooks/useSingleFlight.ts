"use client";

import { useCallback, useRef, useState } from "react";

export function useSingleFlight() {
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(async <T>(operation: () => Promise<T>) => {
    if (runningRef.current) {
      return undefined;
    }

    runningRef.current = true;
    setIsRunning(true);

    try {
      return await operation();
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }
  }, []);

  return { isRunning, run };
}

export function useKeyedSingleFlight<TKey extends string = string>() {
  const runningKeysRef = useRef<Set<TKey>>(new Set());
  const [runningKeys, setRunningKeys] = useState<Set<TKey>>(new Set());

  const isRunning = useCallback(
    (key: TKey) => runningKeys.has(key),
    [runningKeys],
  );

  const run = useCallback(async <T>(key: TKey, operation: () => Promise<T>) => {
    if (runningKeysRef.current.has(key)) {
      return undefined;
    }

    const next = new Set(runningKeysRef.current);
    next.add(key);
    runningKeysRef.current = next;
    setRunningKeys(next);

    try {
      return await operation();
    } finally {
      const after = new Set(runningKeysRef.current);
      after.delete(key);
      runningKeysRef.current = after;
      setRunningKeys(after);
    }
  }, []);

  return { isRunning, run };
}
