export type CanvasBackendSyncPayload = {
  ai?: { text: string; proposed_actions?: unknown[] };
  skipped?: boolean;
  synced?: boolean;
  reason?: string;
  ai_skipped?: boolean;
  error?: string;
};

export async function postCanvasBackendSync(backendUserId: string): Promise<{
  ok: boolean;
  status: number;
  payload: CanvasBackendSyncPayload;
}> {
  const uid = encodeURIComponent(backendUserId);
  const res = await fetch(
    `/api/backend/user/${uid}/integrations/canvas/sync`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const payload = (await res.json()) as CanvasBackendSyncPayload;
  return { ok: res.ok, status: res.status, payload };
}
