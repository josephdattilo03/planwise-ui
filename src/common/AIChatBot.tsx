'use client';

import { useMemo, useRef } from 'react';
import ChatBot from 'react-chatbotify';
import { useCanvasBriefing } from '@/src/app/providers/CanvasBriefingProvider';
import { useTheme } from '@/src/common/ThemeProvider';
import type { Flow, Params } from 'react-chatbotify';

const APPLY_LABEL = 'Yes, apply';
const CANCEL_LABEL = 'No, cancel';
function ConfirmButtons({
  onApply,
  onCancel,
  optionStyle,
}: {
  onApply: () => Promise<void>;
  onCancel: () => Promise<void>;
  optionStyle: React.CSSProperties;
}) {
  return (
    <div
      className="rcb-options-container"
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: 4,
      }}
    >
      <button
        type="button"
        onClick={() => onApply()}
        style={{
          ...optionStyle,
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {APPLY_LABEL}
      </button>
      <button
        type="button"
        onClick={() => onCancel()}
        style={{
          ...optionStyle,
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {CANCEL_LABEL}
      </button>
    </div>
  );
}

export default function AIChatBot() {
  const { theme } = useTheme();
  const { briefing: canvasBriefing, briefingNonce } = useCanvasBriefing();
  const pendingPlanRef = useRef<{
    proposed_actions: unknown[];
  } | null>(null);

  const flow: Flow = useMemo(() => {
    const confirmComponent = (params: Params) => {
      if (!pendingPlanRef.current?.proposed_actions?.length) return null;
      const optionStyle = {
        backgroundColor: 'var(--menu-bg)',
        color: theme === 'dark' ? '#ffffff' : 'var(--green-2)',
        border: '1px solid var(--green-2)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 12px',
      };
      return (
        <ConfirmButtons
          optionStyle={optionStyle}
          onApply={async () => {
            await params.injectMessage(APPLY_LABEL, 'USER');
            await params.goToPath('execute_plan');
          }}
          onCancel={async () => {
            await params.injectMessage(CANCEL_LABEL, 'USER');
            await params.goToPath('cancelled');
          }}
        />
      );
    };

    return {
      start: {
        message: async () => {
          if (canvasBriefing) {
            const actions = canvasBriefing.proposed_actions ?? [];
            pendingPlanRef.current =
              actions.length > 0 ? { proposed_actions: actions } : null;
            const base = canvasBriefing.text;
            return actions.length > 0
              ? `${base}\n\nApply these changes?`
              : base;
          }
          return 'Ask me for help with your schedule!';
        },
        component: confirmComponent,
        path: 'gemini',
      },
      gemini: {
        message: async (params) => {
          pendingPlanRef.current = null;
          const res = await fetch('/api/ai/schedule-agent', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              prompt: params.userInput,
              plan_only: true,
            }),
          });
          const data = await res.json();
          if (!res.ok) return data.error ?? 'Sorry—something went wrong.';
          const text = data.text ?? 'Sorry—something went wrong.';
          const actions = Array.isArray(data.proposed_actions)
            ? data.proposed_actions
            : [];
          if (actions.length > 0) {
            pendingPlanRef.current = { proposed_actions: actions };
            return `${text}\n\nApply these changes?`;
          }
          return text;
        },
        component: confirmComponent,
        path: () => 'gemini',
      },
      confirm_plan: {
        message: '',
        options: [APPLY_LABEL, CANCEL_LABEL],
        path: (params) => {
          if (params.userInput === APPLY_LABEL) return 'execute_plan';
          return 'cancelled';
        },
      },
      execute_plan: {
        message: async () => {
          const pending = pendingPlanRef.current;
          pendingPlanRef.current = null;
          if (!pending?.proposed_actions?.length) {
            return 'No pending actions.';
          }
          const res = await fetch('/api/ai/schedule-agent', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ execute_plan: pending.proposed_actions }),
          });
          const data = await res.json();
          if (!res.ok)
            return data.error ?? 'Something went wrong applying changes.';
          return data.text ?? 'Changes applied.';
        },
        path: 'gemini',
      },
      cancelled: {
        message: 'No changes made.',
        path: 'gemini',
      },
    };
  }, [canvasBriefing, theme]);

  const styles = {
    tooltipStyle: {
      backgroundColor: 'var(--menu-bg)',
      color: 'var(--foreground)',
      // border: "1px solid var(--card-border)",
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
      backgroundColor: 'var(--menu-bg)',
      color: theme === 'dark' ? '#ffffff' : 'var(--green-2)',
      border: '1px solid var(--green-2)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    },
    botOptionHoveredStyle: {
      backgroundColor: 'var(--green-2)',
      color: '#ffffff',
      border: '1px solid var(--green-2)',
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
      botDelay: 0, // Show confirmation buttons immediately after the proposal (no 1s wait)
    },
    tooltip: {
      mode: 'CLOSE',
      text: 'Ask me for help with your schedule!',
    },
    chatButton: {
      icon: '/owl.svg',
    },
  };

  // Remount when a Canvas briefing arrives (or a new one replaces the last).
  const chatKey = canvasBriefing
    ? `planwise-canvas-${briefingNonce}`
    : `planwise-default-${briefingNonce}`;

  // `react-chatbotify` has a fairly strict `Styles` type; these CSS variable
  // values are runtime strings, so we cast to avoid build-time failures.
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
