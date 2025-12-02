import { Task } from "@/src/app/types";
import { useTranslations } from "next-intl";
import BoardChip from "../boards/BoardChip";
import TagChip from "../tags/TagChip";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const t = useTranslations("TaskCard");
  const getProgressClass = (progress: Task["progress"]) => {
    switch (progress) {
      case "to-do":
        return "bg-task-status-to-do-button text-task-status-to-do-text inset-ring-task-status-to-do-stroke";
      case "in-progress":
        return "bg-task-status-in-prog-button text-task-status-in-prog-text inset-ring-task-status-in-prog-stroke";
      case "done":
        return "bg-task-status-done-button text-task-status-done-text inset-ring-task-status-done-stroke";
      case "pending":
        return "bg-task-status-pending-button text-task-status-pending-text inset-ring-task-status-pending-stroke";
      default:
        return "";
    }
  };

  return (
    <div
      className="flex flex-col gap-2 border border-(--task-stroke) rounded-2xl p-3 cursor-pointer"
      onClick={onClick}
    >
      <div>
        <h1 className="text-body">{task.name}</h1>
      </div>
      <div>
        <div className="flex flex-row gap-3 items-center text-nowrap">
          <span
            className={
              "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring " +
              getProgressClass(task.progress)
            }
          >
            {t(`task-${task.progress}`)}
          </span>
          <p>
            {Array.from({ length: task.priorityLevel + 1 }).map((_, i) => (
              <span className="text-red" key={i}>
                !
              </span>
            ))}
          </p>
          <p className="text-label text-(--task-date-due-text)">
            Due:{" "}
            {task.dueDate.toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <BoardChip board={task.board}></BoardChip>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        {task.tags.map((tag, idx) => (
          <TagChip key={idx} tag={tag}></TagChip>
        ))}
      </div>
    </div>
  );
}
