import { WebSocket } from "ws"; //eslint-disable-line

declare module 'ws'{
    interface WebSocket{
        isAlive: boolean;
    }
}