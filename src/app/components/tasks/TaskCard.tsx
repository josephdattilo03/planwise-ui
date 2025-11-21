import { Task } from '@/src/app/types'
import { useTranslations } from 'next-intl'
import BoardChip from '../boards/BoardChip'
import TagChip from '../tags/TagChip'

export default function TaskCard() {
    const dummyTask: Task = {
        name: "test task",
        progress: "done",
        priorityLevel: 2,
        dueDate: new Date(2025, 10, 17, 5, 47, 0, 0),
        board: {
            name: "test board",
            color: "#299e68"
        },
        tags: [{
            name: "test1",
            textColor: "#1a3c65",
            backgroundColor: "#41d207",
            borderColor: "#1a3c65",
        },
        {
            name: "test2",
            textColor: "#1a3c65",
            backgroundColor: "#41d207",
            borderColor: "#1a3c65",
        }
        ]

    }
    const t = useTranslations("TaskCard")
    const getProgressClass = (progress: Task["progress"]) => {
        switch (progress) {
            case "to-do":
                return "bg-(--color-task-status-to-do-button text-(--color-task-status-to-do-text) inset-ring-(--color-task-status-to-do-stroke)"
            case "in-progress":
                return "bg-(--color-task-status-in-prog-button text-(--color-task-status-in-prog-text) inset-ring-(--color-task-status-in-prog-stroke)"
            case "done":
                return "bg-(--color-task-status-done-button text-(--color-task-status-done-text) inset-ring-(--color-task-status-done-stroke)"
            default:
                return ""
        }
    }


    return (
        <div className='flex flex-col gap-2'>
            <div>
                <h1 className="text-body">{dummyTask.name}</h1>
            </div>
            <div>
                <div className='flex flex-row gap-3'>
                    <span className={"inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring " + getProgressClass(dummyTask.progress)}>{t(`task-${dummyTask.progress}`)}</span>
                    <p>
                        {Array.from({ length: dummyTask.priorityLevel + 1 }).map((_, i) => (
                            <span className='text-red' key={i}>!</span>
                        ))}
                    </p>
                    <p className="">Due: {dummyTask.dueDate.toLocaleDateString("en", {
                        month: "short",
                        day: "numeric"
                    })}</p>
                    <BoardChip board={dummyTask.board}></BoardChip>
                </div>
            </div>
            <div className="flex flex-row gap-3">
                {dummyTask.tags.map((tag, idx) => (
                    <TagChip key={idx} tag={tag}></TagChip>
                ))}
            </div>
        </div>
    )
}
