import WebSocket from 'ws';

export interface Room {
    admins: Set<WebSocket>; users: Set<WebSocket>;
    maxAdmins: number; correctAnswer: string | null;
    roundFinishtime: number | null; roundFinishTimeout: NodeJS.Timeout | undefined;
    empty?: boolean; snapshot?: Buffer;
}

export const rooms: Record<string, Room> = {};

export interface Message {
    type: string;
    text?: string;
    sender?: string;
}