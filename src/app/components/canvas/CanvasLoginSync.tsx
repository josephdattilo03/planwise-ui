'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { useCanvasBriefing } from '@/src/app/providers/CanvasBriefingProvider';
import { getDataMode } from '@/src/app/services/dataMode';

/**
 * After sign-in, triggers Canvas sync on planwise-api once per tab session.
 * Backend stores assignment fingerprints in DynamoDB and returns an AI briefing
 * when Canvas data changes; this component passes it to the chatbot context.
 */
export function CanvasLoginSync() {
  const { data: session, status } = useSession();
  const { setCanvasBriefing } = useCanvasBriefing();
  const ran = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }
    if (getDataMode() === 'mock') {
      return;
    }
    const tabKey = `planwise.canvasSync:${session.user.id}`;
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(tabKey)
    ) {
      return;
    }
    if (ran.current) {
      return;
    }
    ran.current = true;

    void (async () => {
      try {
        const uid = encodeURIComponent(session.user.id);
        const res = await fetch(
          `/api/backend/user/${uid}/integrations/canvas/sync`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );
        const data = (await res.json()) as {
          ai?: { text: string; proposed_actions?: unknown[] };
          skipped?: boolean;
        };
        if (res.ok && data.ai?.text) {
          setCanvasBriefing({
            text: data.ai.text,
            proposed_actions: Array.isArray(data.ai.proposed_actions)
              ? data.ai.proposed_actions
              : [],
          });
        }
        if (res.ok && typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(tabKey, '1');
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [status, session?.user?.id, setCanvasBriefing]);

  return null;
}
