import React, { useState } from 'react'
import FilterSection from '../FilterSection'
import { IconButton } from '@mui/material';
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import { useFilters } from '@/src/app/providers/filters/useFilters';

export default function PriorityFilterSection() {
    const {selectedPriorities, togglePriority} = useFilters()
    return (
        <div>
            <FilterSection
                title="Priority">
                    {Array.from({ length: 4 }, (_, index) => (
                <IconButton
                    key={index}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="p-0"
                >
                    <RemoveCircleOutlineRoundedIcon
                        className="w-4 h-4"
                    />
                    <span>hey there this is a thing</span>
                </IconButton>
))}
            </FilterSection>
        </div>
    )
}
