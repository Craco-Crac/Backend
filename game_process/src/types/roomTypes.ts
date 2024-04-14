import WebSocket from 'ws';

export const rooms: Record<string, {
    admins: Set<WebSocket>; users: Set<WebSocket>;
    maxAdmins: number; correctAnswer: string | null;
    roundFinishtime: number | null; roundFinishTimeout: NodeJS.Timeout | undefined;
    empty?: boolean;
}> = {};