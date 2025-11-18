import React from 'react'
import { Task } from '@/app/types'

export default function TaskCard() {
    const dummyTask: Task= {
        name: "test task",
        progress: "to-do",
        priorityLevel: 2,
        dueDate: new Date(2025, 10, 17, 5, 47, 0, 0),
        board: {
            name: "test board",
            color: "#299e68ff"
        },
        tags: [{
            name: "test tag",
            textColor: "#1a3c65ff",
            backgroundColor: "#41d207ff"
        }]

    }


  return (
    <div>
        <div>
            <h1>{dummyTask.name}</h1>
        </div>
        <div>
            <div></div>
        </div>
        <div></div>
        <div></div>
    </div>
  )
}
