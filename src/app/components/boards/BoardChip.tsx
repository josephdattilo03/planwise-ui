import React from 'react'
import { Board } from '../../types'

type BoardChipProps = {
    board: Board
}

export default function BoardChip({ board }: BoardChipProps) {
    return (
        <div className="flex gap-2 items-center justify-center">
            <div className="w-3 h-3 rounded-full"
            style={{backgroundColor: board.color}}
            ></div>
            <p>{board.name}</p>
        </div>
    )
}
