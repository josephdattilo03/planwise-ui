import React from 'react'
import { FolderNode } from '../../types/workspace';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FolderChipProps {
    node: FolderNode;
    toggleFolder: (id: string) => void
    isExpanded: boolean
}

export default function FolderChip({ node, toggleFolder, isExpanded }: FolderChipProps) {
    return (
        <div className='flex flex-row items-center gap-1'>
            <button
                className="p-0.5 hover:bg-gray-200 rounded"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(node.id);
                }}
            >
                {isExpanded ? (
                    <ExpandMoreIcon></ExpandMoreIcon>
                ) : (
                    <ChevronRightIcon></ChevronRightIcon>
                )}
            </button>
            <FolderIcon></FolderIcon>
            <span className="text-chip-info">{node.name}</span>
        </div>
    )
}
