import { Chip } from '@mui/material'
import React from 'react'

interface FilterButtonProps {
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
    label: string;
    onClick: () => void
}

export default function FilterButton({ label, color, onClick }: FilterButtonProps) {
    return (
        <Chip color={color} label={label} onClick={onClick} />
    )
}
