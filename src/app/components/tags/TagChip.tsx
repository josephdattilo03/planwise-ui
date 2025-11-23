import React from 'react'
import { Tag } from '../../types'

type TagChipProps = {
    tag: Tag
}

export default function TagChip({ tag }: TagChipProps) {
    return (
        <div>
            <p
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-chip-info"
                style={{
                    backgroundColor: tag.backgroundColor,
                    color: tag.textColor,
                    border: `1px solid ${tag.borderColor}`,
                }}
            >
                {tag.name}
            </p>

        </div>
    )
}
