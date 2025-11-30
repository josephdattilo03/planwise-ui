import React from 'react'
import { Task } from '../../types'
import TaskCard from './TaskCard'

interface TaskListProps {
    taskList: Task[]
}

export default function TaskList({taskList}: TaskListProps) {

    return (
        <div className="flex flex-col gap-2">
            {taskList.map((task, idx) => (
                    <TaskCard key={idx} task={task}></TaskCard>
                ))}
        </div>
    )
}
