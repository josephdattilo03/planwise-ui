import React from 'react'
import { Task } from '../../types'
import TaskCard from './TaskCard'

interface TaskListProps {
    taskList: Task[]
}

export default function TaskList({taskList}: TaskListProps) {
    // const dummyTaskList: Task[] = [
    //     {
    //         name: "test task",
    //         progress: "done",
    //         priorityLevel: 2,
    //         dueDate: new Date(2025, 10, 17, 5, 47, 0, 0),
    //         board: {
    //             name: "test board",
    //             color: "#299e68"
    //         },
    //         tags: [{
    //             name: "test1",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         },
    //         {
    //             name: "test2",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         }
    //         ]
    //     },
    //     {
    //         name: "test task",
    //         progress: "done",
    //         priorityLevel: 2,
    //         dueDate: new Date(2025, 10, 17, 5, 47, 0, 0),
    //         board: {
    //             name: "test board",
    //             color: "#299e68"
    //         },
    //         tags: [{
    //             name: "test1",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         },
    //         {
    //             name: "test2",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         }
    //         ]
    //     },
    //     {
    //         name: "test task",
    //         progress: "done",
    //         priorityLevel: 2,
    //         dueDate: new Date(2025, 10, 17, 5, 47, 0, 0),
    //         board: {
    //             name: "test board",
    //             color: "#299e68"
    //         },
    //         tags: [{
    //             name: "test1",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         },
    //         {
    //             name: "test2",
    //             textColor: "#1a3c65",
    //             backgroundColor: "#41d207",
    //             borderColor: "#1a3c65",
    //         }
    //         ]
    //     }
    // ]



    return (
        <div className="flex flex-col gap-2">
            {taskList.map((task, idx) => (
                    <TaskCard key={idx} task={task}></TaskCard>
                ))}
        </div>
    )
}
