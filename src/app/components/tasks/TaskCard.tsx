import { Task } from "@/src/app/types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import BoardChip from "../boards/BoardChip";
import TagChip from "../tags/TagChip";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { resolveTagsWithCatalog } from "../../services/tags/tagService";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const t = useTranslations("TaskCard");
  const { tags: tagCatalog } = useBoardsTags();
  const displayTags = useMemo(
    () => resolveTagsWithCatalog(task.tags, tagCatalog),
    [task.tags, tagCatalog]
  );
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
      className="flex flex-col gap-2 border border-border rounded-lg p-3 cursor-pointer bg-background"
      onClick={onClick}
    >
      <div>
        <h1 className="text-body">{task.name}</h1>
      </div>
      <div>
        <div className="flex flex-row gap-3 items-center text-nowrap">
          <span
            className={
              "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium inset-ring " +
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
        {displayTags.map((tag) => (
          <TagChip key={tag.id} tag={tag}></TagChip>
        ))}
      </div>
    </div>
  );
}
