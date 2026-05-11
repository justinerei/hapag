import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

const STORAGE_KEY = 'hapag_order_notifications';
const SEEN_KEY    = 'hapag_orders_seen_statuses';

/**
 * useOrderNotifications
 * Polls /api/orders/statuses every 15s, compares against last-seen
 * snapshot in localStorage, and returns the unseen count.
 *
 * @param {boolean} isOnOrdersPage  Pass true on OrdersIndex to auto-clear badge.
 */
export function useOrderNotifications(isOnOrdersPage = false) {
    const [unreadCount,  setUnreadCount]  = useState(() => {
        try { return Number(localStorage.getItem(STORAGE_KEY) ?? 0); } catch { return 0; }
    });
    const [latestChange, setLatestChange] = useState(null);
    const intervalRef = useRef(null);
    const isMounted   = useRef(true);

    const getSeenStatuses = () => {
        try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}'); } catch { return {}; }
    };
    const saveSeenStatuses = (map) => {
        try { localStorage.setItem(SEEN_KEY, JSON.stringify(map)); } catch {}
    };
    const saveCount = (n) => {
        try { localStorage.setItem(STORAGE_KEY, String(n)); } catch {}
    };

    const markAllSeen = useCallback(() => {
        setUnreadCount(0);
        saveCount(0);
        setLatestChange(null);
    }, []);

    const checkForUpdates = useCallback(async () => {
        try {
            const res = await fetch('/api/orders/statuses', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok || !isMounted.current) return;

            const { orders } = await res.json();
            if (!Array.isArray(orders)) return;

            const seen    = getSeenStatuses();
            let   changes = 0;
            let   newest  = null;

            orders.forEach(({ id, status }) => {
                const key      = String(id);
                const previous = seen[key];
                if (previous === undefined) { seen[key] = status; return; }
                if (previous !== status) {
                    changes++;
                    newest = { orderId: id, from: previous, to: status };
                    seen[key] = status;
                }
            });

            saveSeenStatuses(seen);

            if (changes > 0 && isMounted.current) {
                setUnreadCount(prev => {
                    const next = prev + changes;
                    saveCount(next);
                    return next;
                });
                setLatestChange(newest);
            }
        } catch { /* silent fail */ }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        if (isOnOrdersPage) markAllSeen();
        checkForUpdates();
        intervalRef.current = setInterval(checkForUpdates, 15_000);
        return () => {
            isMounted.current = false;
            clearInterval(intervalRef.current);
        };
    }, [isOnOrdersPage, checkForUpdates, markAllSeen]);

    return { unreadCount, latestChange, markAllSeen };

    
}