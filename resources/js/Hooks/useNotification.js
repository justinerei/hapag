import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export function useNotification() {
    const { auth } = usePage().props;

    useEffect(() => {
        // Mag-set tayo ng interval para i-check ang server bawat 30 seconds
        // para sa mga bagong notifications nang hindi nagre-reload ang page.
        if (!auth.user) return;

        const interval = setInterval(() => {
            router.reload({ 
                only: ['notifications', 'orderNotifCount'], 
                preserveScroll: true,
                preserveState: true 
            });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [auth.user]);

    // Function para i-mark as read ang notif
    const markAsRead = (id = null) => {
        const url = id ? route('notifications.read.one', id) : route('notifications.read');
        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Notification marked as read');
            }
        });
    };

    return { markAsRead };
}