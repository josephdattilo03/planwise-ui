const isProd = process.env.NODE_ENV === "production";

export const API_BASE =
    isProd
    ? (process.env.NEXT_PUBLIC_API_BASE_PROD as string)
    : (process.env.NEXT_PUBLIC_API_BASE_DEV as string);


export const ROUTES = {
    userRoot: "/user",

    // Tags
    createTag: "/user/tag",
    userTag: (userId: string | number, id: string | number) =>
        `/user/${userId}/tag/${id}`,
    userTags: (userId: string | number) => `/user/${userId}/tag/`,

    // Folders
    createFolder: "/user/folder",
    userFolder: (userId: string | number, id: string | number) =>
        `/user/${userId}/folder/${id}`,
    userFoldersByDepth: (
        userId: string | number,
        depth: string | number,
        path: string
    ) => `/user/${userId}/folder/${depth}/${path}`,

    // Boards
    createBoard: "/user/board",
    userBoards: (userId: string | number) => `/user/${userId}/board/`,
    userBoard: (userId: string | number, id: string | number) =>
        `/user/${userId}/board/${id}`,
    userBoardsByDepth: (
        userId: string | number,
        depth: string | number,
        path: string
    ) => `/user/${userId}/board/${depth}/${path}`,

    // Events
    createEvent: "/board/event",
    boardEvents: (boardId: string | number) => `/board/${boardId}/event/`,
    boardEvent: (boardId: string | number, id: string | number) =>
        `/board/${boardId}/event/${id}`,

    // Tasks
    createTask: "/board/task",
    boardTask: (boardId: string | number, id: string | number) =>
        `/board/${boardId}/task/${id}`,
    userTasks: (userId: string | number) =>
        `/user/${userId}/task`
};
