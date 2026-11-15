import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

export const NotificationBell: React.FC<{ profileId?: string }> = ({ profileId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifs = async () => {
    if (!profileId) return;
    try {
      const res = await api.get(`/notifications/${profileId}/notifications`);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [profileId]);

  const markAllRead = async () => {
    if (!profileId) return;
    try {
      await api.put(`/notifications/read-all/${profileId}`);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllRead();
        }}
        className="relative p-3 rounded-full hover:bg-stone-200 text-navy transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className="w-6 h-6 text-navy" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border-2 border-stone-200 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 bg-canvas border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-navy text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-teal hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-stone-500 text-sm">No new notifications</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n._id} className={`p-4 ${n.status !== 'read' ? 'bg-soft-mint/40' : ''}`}>
                  <p className="text-sm font-bold text-navy">{n.title}</p>
                  <p className="text-xs text-stone-600 mt-1">{n.message}</p>
                  <p className="text-[10px] text-stone-400 mt-2">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-stone-50 text-center border-t border-stone-200">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold text-teal hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
