"use client"

import { useState, useEffect } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { getNotifications, markNotificationAsRead, Notification } from "@/features/proposals/actions/notification_actions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
    };

    useEffect(() => {
        fetchNotifications();
        // Polling básico a cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await markNotificationAsRead(id);
        if (success) {
            fetchNotifications();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-brand-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-4 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                <Bell className="w-4 h-4 text-brand-purple" /> Notificações
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-sm italic">
                                    Nenhuma notificação por enquanto.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b border-white/5 flex gap-3 transition-colors ${n.read ? 'opacity-60' : 'bg-brand-purple/5'}`}
                                    >
                                        <div className="flex-1">
                                            <p className={`text-sm ${n.read ? 'text-neutral-400' : 'text-white font-medium'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] text-neutral-600">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                                <div className="flex gap-2">
                                                    {!n.read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(n.id, e)}
                                                            className="p-1 hover:bg-green-500/20 text-green-500 rounded transition-colors"
                                                            title="Marcar como lida"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {n.link && (
                                                        <Link
                                                            href={n.link}
                                                            className="p-1 hover:bg-white/10 text-neutral-400 rounded transition-colors"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-white/[0.02] text-center border-t border-white/10">
                                <button className="text-xs text-neutral-500 hover:text-brand-purple transition-colors">
                                    Ver todas as atividades
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
