import { Board } from "./board"

export type Node = FolderNode | Board 

export interface FolderNode {
    type: "folder"
    name : string
    children : Node[]
}

export interface BoardNode {
    type: "board"
    board: Board
}