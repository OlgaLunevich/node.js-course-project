import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { WsMessage } from '../types/ws';

const WS_URL = 'ws://localhost:5000';

export function useWsNotifications() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef<number | null>(null);
    const stoppedRef = useRef(false);

    const wasConnectedRef = useRef(false);
    const errorToastShownRef = useRef(false);

    useEffect(() => {
        stoppedRef.current = false;

        const connect = () => {
            if (stoppedRef.current) return;

            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                wasConnectedRef.current = true;
                errorToastShownRef.current = false;
                console.log('WS connected');
            };

            ws.onmessage = (event) => {
                try {
                    const msg: WsMessage = JSON.parse(event.data);
                    console.log('WS message:', msg);

                    switch (msg.type) {
                        case 'article_created':
                            toast.success(msg.message);
                            break;
                        case 'article_updated':
                            toast.info(msg.message);
                            break;
                        case 'article_deleted':
                            toast.warn(msg.message);
                            break;
                        default:
                            break;
                    }
                } catch {
                }
            };

            ws.onerror = () => {
                if (wasConnectedRef.current && !errorToastShownRef.current) {
                    toast.error('WebSocket error');
                    errorToastShownRef.current = true;
                }
            };

            ws.onclose = (e) => {
                console.log('WS closed:', e.code, e.reason);

                if (stoppedRef.current) return;

                if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
                reconnectRef.current = window.setTimeout(connect, 1500);
            };
        };

        connect();

        return () => {
            stoppedRef.current = true;
            if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, []);
}
