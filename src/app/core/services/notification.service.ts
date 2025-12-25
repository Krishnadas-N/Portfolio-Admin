import { Injectable, signal } from '@angular/core';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string; // or Date
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    icon?: string;
    link?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // Mock initial data
    notifications = signal<Notification[]>([
        {
            id: '1',
            title: 'New User Registered',
            message: 'Alex Johnson signed up for the newsletter.',
            time: '2 mins ago',
            read: false,
            type: 'info',
            icon: 'fa-regular fa-user'
        },
        {
            id: '2',
            title: 'Blog Post Published',
            message: 'Your post "The Future of AI" is now live.',
            time: '1 hour ago',
            read: false,
            type: 'success',
            icon: 'fa-solid fa-check'
        },
        {
            id: '3',
            title: 'System Update',
            message: 'Portfolio Admin v2.0 will be deployed tonight.',
            time: '5 hours ago',
            read: true,
            type: 'warning',
            icon: 'fa-solid fa-server'
        },
        {
            id: '4',
            title: 'New Comment',
            message: 'Sarah left a comment on "Web Design Trends".',
            time: '1 day ago',
            read: true,
            type: 'info',
            icon: 'fa-regular fa-comment'
        }
    ]);

    unreadCount = signal(2);

    constructor() {
        this.updateUnreadCount();
    }

    add(notification: Omit<Notification, 'id' | 'read' | 'time'>) {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            read: false,
            time: 'Just now'
        };

        this.notifications.update(current => [newNotification, ...current]);
        this.updateUnreadCount();
    }

    markAsRead(id: string) {
        this.notifications.update(current =>
            current.map(n => n.id === id ? { ...n, read: true } : n)
        );
        this.updateUnreadCount();
    }

    markAllAsRead() {
        this.notifications.update(current =>
            current.map(n => ({ ...n, read: true }))
        );
        this.updateUnreadCount();
    }

    clearAll() {
        this.notifications.set([]);
        this.updateUnreadCount();
    }

    remove(id: string) {
        this.notifications.update(current => current.filter(n => n.id !== id));
        this.updateUnreadCount();
    }

    private updateUnreadCount() {
        this.unreadCount.set(this.notifications().filter(n => !n.read).length);
    }
}
