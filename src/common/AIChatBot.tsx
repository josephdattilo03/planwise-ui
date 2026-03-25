'use client';

import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import ChatBot from 'react-chatbotify';
import { dispatchScheduleAgentMutated } from '@/src/app/services/scheduleAgentRefresh';
import { useCanvasBriefing } from '@/src/app/providers/CanvasBriefingProvider';
import type { Flow, Params } from 'react-chatbotify';

const APPLY_LABEL = 'Yes, apply';
const CANCEL_LABEL = 'No, cancel';

function scheduleAgentCalendarPayload() {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_local_date: `${y}-${m}-${d}`,
  };
}

const confirmBtnTransition: CSSProperties = {
  transition:
    'background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.08s ease',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
};

function ConfirmButtons({
  onApply,
  onCancel,
  optionStyle,
  optionHoveredStyle,
}: {
  onApply: () => Promise<void>;
  onCancel: () => Promise<void>;
  optionStyle: CSSProperties;
  optionHoveredStyle: CSSProperties;
}) {
  const [hovered, setHovered] = useState<'apply' | 'cancel' | null>(null);
  const [pressed, setPressed] = useState<'apply' | 'cancel' | null>(null);
  const [busy, setBusy] = useState(false);

  const visual = (key: 'apply' | 'cancel'): CSSProperties => {
    const base = { ...optionStyle, ...confirmBtnTransition };
    const hover = hovered === key ? { ...base, ...optionHoveredStyle } : base;
    return {
      ...hover,
      cursor: busy ? 'wait' : 'pointer',
      opacity: busy ? 0.72 : 1,
      transform:
        pressed === key ? 'scale(0.97)' : hovered === key ? 'scale(1.01)' : 'scale(1)',
      boxShadow:
        hovered === key ? 'var(--chatbot-confirm-hover-shadow)' : undefined,
      outline: 'none',
    };
  };

  const run = async (fn: () => Promise<void>) => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="rcb-options-container planwise-confirm-actions"
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: 0,
      }}
    >
      <button
        type="button"
        className="planwise-confirm-btn"
        disabled={busy}
        style={visual('apply')}
        onMouseEnter={() => setHovered('apply')}
        onMouseLeave={() => {
          setHovered(null);
          setPressed(null);
        }}
        onMouseDown={() => setPressed('apply')}
        onMouseUp={() => setPressed(null)}
        onFocus={() => setHovered('apply')}
        onBlur={() => {
          setHovered(null);
          setPressed(null);
        }}
        onClick={() => void run(onApply)}
      >
        {APPLY_LABEL}
      </button>
      <button
        type="button"
        className="planwise-confirm-btn"
        disabled={busy}
        style={visual('cancel')}
        onMouseEnter={() => setHovered('cancel')}
        onMouseLeave={() => {
          setHovered(null);
          setPressed(null);
        }}
        onMouseDown={() => setPressed('cancel')}
        onMouseUp={() => setPressed(null)}
        onFocus={() => setHovered('cancel')}
        onBlur={() => {
          setHovered(null);
          setPressed(null);
        }}
        onClick={() => void run(onCancel)}
      >
        {CANCEL_LABEL}
      </button>
    </div>
  );
}

/**
 * react-chatbotify only applies the bot bubble chrome when content is a string.
 * Custom JSX is rendered as a Fragment without the styled .rcb-bot-message wrapper,
 * so we replicate the same visual shell (matches library: secondaryColor + botBubbleStyle).
 */
function botBubbleShell(children: ReactNode): ReactElement {
  return (
    <div
      className="rcb-bot-message planwise-bot-bubble"
      style={{
        /* Keep aligned with settings.general.secondaryColor (bot bubble fill). */
        backgroundColor: 'var(--green-1)',
        color: '#ffffff',
        maxWidth: 'min(70%, 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 14px',
        fontSize: '14px',
        boxSizing: 'border-box',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </div>
  );
}

function proposalBubble(
  params: Params,
  text: string,
  actions: unknown[],
  optionStyle: CSSProperties,
  optionHoveredStyle: CSSProperties,
) {
  const hasActions = actions.length > 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '100%',
      }}
    >
      {botBubbleShell(
        <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
      )}
      {hasActions ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
            paddingLeft: 2,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--foreground)',
              opacity: 0.85,
            }}
          >
            Apply these changes?
          </span>
          <ConfirmButtons
            optionStyle={optionStyle}
            optionHoveredStyle={optionHoveredStyle}
            onApply={async () => {
              await params.injectMessage(APPLY_LABEL, 'USER');
              await params.goToPath('execute_plan');
            }}
            onCancel={async () => {
              await params.injectMessage(CANCEL_LABEL, 'USER');
              await params.goToPath('cancelled');
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function AIChatBot() {
  const { briefing: canvasBriefing, briefingNonce } = useCanvasBriefing();
  /** Latest proposed_actions for execute_plan; set in the same async step as the bubble UI. */
  const pendingActionsRef = useRef<unknown[]>([]);

  const flow: Flow = useMemo(() => {
    const optionStyle: CSSProperties = {
      backgroundColor: 'var(--chatbot-confirm-default-bg)',
      color: 'var(--chatbot-confirm-default-fg)',
      border: '1px solid var(--chatbot-confirm-default-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    };
    const optionHoveredStyle: CSSProperties = {
      backgroundColor: 'var(--chatbot-confirm-hover-bg)',
      color: 'var(--chatbot-confirm-hover-fg)',
      border: '1px solid var(--chatbot-confirm-hover-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    };

    /**
     * react-chatbotify runs block sections in Object.keys order. Bundlers can reorder keys,
     * so `component` may run before `message`, leaving pendingActionsRef empty and hiding
     * confirm UI. We use a single `component` that fetches, updates the ref, and renders
     * text + buttons together so ordering cannot break confirmations.
     */
    return {
      start: {
        component: async (params: Params) => {
          if (canvasBriefing) {
            const actions = canvasBriefing.proposed_actions ?? [];
            pendingActionsRef.current = actions;
            return proposalBubble(
              params,
              canvasBriefing.text,
              actions,
              optionStyle,
              optionHoveredStyle,
            );
          }
          pendingActionsRef.current = [];
          return botBubbleShell(
            <>Ask me for help with your schedule!</>,
          );
        },
        path: 'gemini',
      },
      gemini: {
        component: async (params: Params) => {
          pendingActionsRef.current = [];
          const res = await fetch('/api/ai/schedule-agent', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              prompt: params.userInput,
              plan_only: true,
              ...scheduleAgentCalendarPayload(),
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            pendingActionsRef.current = [];
            return botBubbleShell(
              <>{data.error ?? 'Sorry—something went wrong.'}</>,
            );
          }
          const text = data.text ?? 'Sorry—something went wrong.';
          const actions = Array.isArray(data.proposed_actions)
            ? data.proposed_actions
            : [];
          pendingActionsRef.current = actions;
          return proposalBubble(
            params,
            text,
            actions,
            optionStyle,
            optionHoveredStyle,
          );
        },
        path: () => 'gemini',
      },
      execute_plan: {
        message: async () => {
          const toApply = pendingActionsRef.current;
          pendingActionsRef.current = [];
          if (!toApply.length) {
            return 'No pending actions.';
          }
          const res = await fetch('/api/ai/schedule-agent', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ execute_plan: toApply }),
          });
          const data = await res.json();
          if (!res.ok)
            return data.error ?? 'Something went wrong applying changes.';
          dispatchScheduleAgentMutated();
          return data.text ?? 'Changes applied.';
        },
        path: 'gemini',
      },
      cancelled: {
        message: async () => {
          pendingActionsRef.current = [];
          return 'No changes made.';
        },
        path: 'gemini',
      },
    };
  }, [canvasBriefing]);

  const styles = {
    tooltipStyle: {
      backgroundColor: 'var(--menu-bg)',
      color: 'var(--foreground)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 10px',
      fontSize: '12px',
    },
    notificationBadgeStyle: {
      backgroundColor: 'var(--red)',
      color: '#ffffff',
      borderRadius: 999,
      border: '2px solid var(--card-bg)',
    },
    headerStyle: {
      background: 'var(--green-1)',
      color: '#ffffff',
      padding: '12px 14px',
      fontWeight: 400,
      letterSpacing: '-0.2px',
      borderColor: 'var(--border)',
    },
    bodyStyle: {
      backgroundColor: 'var(--background)',
      padding: '12px',
    },
    userBubbleStyle: {
      textAlign: 'left',
      fontSize: '14px',
    },
    botBubbleStyle: {
      fontSize: '14px',
    },
    chatInputContainerStyle: {
      backgroundColor: 'var(--off-white)',
      borderTop: '1px solid var(--card-border)',
      padding: '10px',
    },
    chatInputAreaStyle: {
      backgroundColor: 'var(--input-bg)',
      color: 'var(--input-text)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--input-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      fontSize: '12px',
    },
    chatInputAreaFocusedStyle: {
      borderColor: 'var(--green-1)',
      boxShadow:
        '0 0 0 3px color-mix(in srgb, var(--green-1) 22%, transparent)',
    },
    chatInputAreaDisabledStyle: {
      backgroundColor: 'var(--task-inactive-button)',
      borderColor: 'var(--task-inactive-stroke)',
      color: 'var(--dark-green-2)',
      cursor: 'not-allowed',
    },
    characterLimitStyle: {
      color: 'var(--dark-green-2)',
      fontSize: '12px',
      minWidth: '50px',
    },
    characterLimitReachedStyle: {
      color: 'var(--red)',
      fontSize: '12px',
      fontWeight: 400,
    },
    botOptionStyle: {
      backgroundColor: 'var(--chatbot-confirm-default-bg)',
      color: 'var(--chatbot-confirm-default-fg)',
      border: '1px solid var(--chatbot-confirm-default-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    },
    botOptionHoveredStyle: {
      backgroundColor: 'var(--chatbot-confirm-hover-bg)',
      color: 'var(--chatbot-confirm-hover-fg)',
      border: '1px solid var(--chatbot-confirm-hover-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    },
    chatHistoryButtonStyle: {
      backgroundColor: 'transparent',
    },
    sendButtonStyle: {
      borderRadius: 'var(--radius-md)',
    },
  };

  const settings = {
    voice: {
      disabled: true,
    },
    botBubble: {
      simulateStream: true,
    },
    notification: {
      showCount: false,
    },
    fileAttachment: {
      disabled: true,
    },
    general: {
      primaryColor: 'var(--green-2)',
      secondaryColor: 'var(--green-1)',
      showFooter: false,
      fontFamily: 'var(--font-plex-sans)',
      flowStartTrigger: 'ON_CHATBOT_INTERACT',
    },
    header: {
      title: 'Planwise AI',
      showAvatar: false,
    },
    emoji: {
      disabled: true,
    },
    chatInput: {
      characterLimit: 200,
      showCharacterCount: true,
      botDelay: 0,
    },
    tooltip: {
      mode: 'CLOSE',
      text: 'Ask me for help with your schedule!',
    },
    chatButton: {
      icon: '/owl.svg',
    },
  };

  const chatKey = canvasBriefing
    ? `planwise-canvas-${briefingNonce}`
    : `planwise-default-${briefingNonce}`;

  return (
    <ChatBot
      key={chatKey}
      settings={settings}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- library Styles type is narrower than CSS variables
      styles={styles as any}
      flow={flow}
    />
  );
}
