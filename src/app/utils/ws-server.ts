import { WebSocketServer, WebSocket } from 'ws';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import http from 'http';

let wss: WebSocketServer;

const clients = new Map<string, WebSocket>();

export const initWebSocket = (server: http.Server) => {
    wss = new WebSocketServer({
        server,
        path: '/ws',
    });

    wss.on('connection', (socket: WebSocket, req) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const userId = url.searchParams.get('userId');

        if (userId) {
            clients.set(userId, socket);
            console.log(`WS: User ${userId} connected`);
        }

        socket.on('close', () => {
            if (userId) {
                clients.delete(userId);
                console.log(`WS: User ${userId} disconnected`);
            }
        });
    });

    return wss;
};

export const getWebSocketServer = () => {
    if (!wss) {
        throw new AppError(httpStatus.NOT_FOUND, 'WebSocket not initialized yet!');
    }
    return wss;
};

export const sendEventToUser = (event: string, payload: any) => {
    const [, userId] = event.split('::');

    const client = clients.get(userId);

    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, payload }));
    }
};
