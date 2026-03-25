export const SCHEDULE_AGENT_MUTATED_EVENT = "planwise:schedule-agent-mutated";

export function dispatchScheduleAgentMutated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SCHEDULE_AGENT_MUTATED_EVENT));
}
