import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const backendBaseUrl = process.env.PLANWISE_API_URL ?? '';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!backendBaseUrl) {
    return NextResponse.json(
      {
        error: 'PLANWISE_API_URL is not set.',
      },
      { status: 500 },
    );
  }

  let body: {
    prompt?: string;
    message?: string;
    board_ids?: string[];
    plan_only?: boolean;
    execute_plan?: unknown[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const message = body.message ?? body.prompt;
  const hasExecutePlan =
    Array.isArray(body.execute_plan) && body.execute_plan.length > 0;
  if (
    !hasExecutePlan &&
    (message === undefined || typeof message !== 'string')
  ) {
    return NextResponse.json(
      {
        error: 'Missing message or prompt in body (or execute_plan for apply)',
      },
      { status: 400 },
    );
  }

  const uid = encodeURIComponent(session.user.id);
  const url = `${backendBaseUrl.replace(/\/$/, '')}/user/${uid}/schedule/agent`;
  const payload = hasExecutePlan
    ? { execute_plan: body.execute_plan }
    : {
        message: message as string,
        ...(body.board_ids != null && { board_ids: body.board_ids }),
        ...(body.plan_only === true && { plan_only: true }),
      };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? 'Schedule agent request failed', ...data },
        { status: res.status },
      );
    }

    return NextResponse.json({
      text: data.reply ?? '',
      proposed_actions: data.proposed_actions,
      results: data.results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json(
      { error: 'Schedule agent unreachable', details: message },
      { status: 502 },
    );
  }
}
