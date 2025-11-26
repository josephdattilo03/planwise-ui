export function fetchProgress() {
  const PROGRESS_OPTIONS: { [key: string]: string } = {
    "to-do": "To-Do",
    "in-progress": "In Progress",
    done: "Done",
    pending: "Pending",
  };
  return PROGRESS_OPTIONS;
}
export function fetchPriority() {
  const PRIORITY_OPTIONS: { [key: number]: string } = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Now",
  };

  return PRIORITY_OPTIONS;
}
