import { WebSocketServer } from 'ws';

export function initWs(server) {
    const wss = new WebSocketServer({ server });

    function broadcast(payload) {
        const data = JSON.stringify(payload);
        for (const client of wss.clients) {
            if (client.readyState === 1) {
                client.send(data);
            }
        }
    }

    wss.on('connection', (ws) => {
        ws.send(
            JSON.stringify({
                type: 'connected',
                message: 'WebSocket connected',
                ts: Date.now(),
            })
        );
    });

    return { wss, broadcast };
}
