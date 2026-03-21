export type PlanwiseDataMode = "backend" | "mock";

const ENV_KEY = "NEXT_PUBLIC_PLANWISE_DATA_MODE";

export function getDataMode(): PlanwiseDataMode {
  const raw = process.env[ENV_KEY];
  if (raw === "mock") return "mock";
  // Default to backend integration so the app works end-to-end by default.
  return "backend";
}

