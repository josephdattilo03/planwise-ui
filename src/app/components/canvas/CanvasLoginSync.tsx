'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';

import { useCanvasBriefing } from '@/src/app/providers/CanvasBriefingProvider';
import { postCanvasBackendSync } from '@/src/app/services/canvasBackendSync';
import { getDataMode } from '@/src/app/services/dataMode';

const VISIBILITY_DEBOUNCE_MS = 90_000;

function canvasSyncDebug(message: string, data?: Record<string, unknown>) {
  if (typeof console === 'undefined' || !console.debug) {
    return;
  }
  if (data) {
    console.debug(`[CanvasSync] ${message}`, data);
  } else {
    console.debug(`[CanvasSync] ${message}`);
  }
}

/**
 * After sign-in, triggers Canvas sync on planwise-api when the app loads and when
 * the user returns to the tab (debounced). Backend compares assignment fingerprints
 * and returns an AI briefing when Canvas data changes; this component passes it
 * to the chatbot context. Uses the same user id as schedule-agent (email when present).
 */
export function CanvasLoginSync() {
  const { data: session, status } = useSession();
  const { setCanvasBriefing } = useCanvasBriefing();
  const inFlight = useRef(false);
  const lastSyncCompletedAt = useRef(0);

  const runSync = useCallback(
    async (source: 'initial' | 'visibility') => {
      if (status !== 'authenticated' || !session?.user) {
        canvasSyncDebug('skip: not authenticated');
        return;
      }
      const backendUserId = session.user.email ?? session.user.id;
      if (!backendUserId) {
        canvasSyncDebug('skip: no backend user id');
        return;
      }
      if (getDataMode() === 'mock') {
        canvasSyncDebug('skip: mock data mode');
        return;
      }
      if (inFlight.current) {
        canvasSyncDebug('skip: sync already in flight', { source });
        return;
      }
      inFlight.current = true;
      canvasSyncDebug('request start', { source });
      try {
        const { ok, status, payload: data } =
          await postCanvasBackendSync(backendUserId);
        const proposed = data.ai?.proposed_actions;
        const proposedCount = Array.isArray(proposed) ? proposed.length : 0;
        canvasSyncDebug('response', {
          source,
          ok,
          status,
          skipped: data.skipped,
          reason: data.reason,
          synced: data.synced,
          aiSkipped: data.ai_skipped,
          hasBriefingText: Boolean(data.ai?.text),
          proposedActions: proposedCount,
        });
        if (ok && data.synced && data.ai?.text) {
          setCanvasBriefing({
            text: data.ai.text,
            proposed_actions: Array.isArray(data.ai.proposed_actions)
              ? data.ai.proposed_actions
              : [],
          });
          canvasSyncDebug('briefing applied to chat context', {
            textChars: data.ai.text.length,
            proposedActions: proposedCount,
          });
        }
      } catch (err) {
        canvasSyncDebug('request failed', {
          source,
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
      lastSyncCompletedAt.current = Date.now();
      inFlight.current = false;
    }
    },
    [status, session?.user, setCanvasBriefing],
  );

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }
    const backendUserId = session.user.email ?? session.user.id;
    if (!backendUserId) {
      return;
    }
    if (getDataMode() === 'mock') {
      return;
    }

    void runSync('initial');

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      if (lastSyncCompletedAt.current === 0) {
        return;
      }
      const now = Date.now();
      if (now - lastSyncCompletedAt.current < VISIBILITY_DEBOUNCE_MS) {
        canvasSyncDebug('visibility: debounced', {
          msSinceLastSync: now - lastSyncCompletedAt.current,
        });
        return;
      }
      void runSync('visibility');
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [status, session?.user, runSync]);

  return null;
}
