import React, { useState } from 'react'
import FilterSection from '../FilterSection'
import { useFilters } from '@/src/app/providers/filters/useFilters';
import FilterButton from '../FilterButton';

export default function PriorityFilterSection() {
    const { selectedPriorities, togglePriority } = useFilters()
    return (
        <div>
            <FilterSection
                title="Priority">
                <div className='flex flex-row gap-1'>
                    {Array.from({ length: 4 }, (_, index) => (
                        <FilterButton 
                        onClick={() => togglePriority(index)}
                        color={selectedPriorities.has(index) ? "error":"default"}
                        key={index}
                        label={"!".repeat(index + 1)}>
                        </FilterButton>
                    ))}
                </div>
            </FilterSection>
        </div>
    )
}
