import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useNotifications,
  useNotificationCount,
  useNotificationActions,
} from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useNotificationCount();
  const { markRead, markAllRead } = useNotificationActions();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Virtualization for 1000+ notifications
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const hasNotifications = notifications.length > 0;

  return (
    <div className="relative z-50">
      {/* Trigger */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen(v => !v)}
        className={`relative transition-all duration-300 hover:bg-slate-100 ${
          open ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
        }`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="notification-dropdown"
      >
        <Bell className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-12 scale-110' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white">
              {unreadCount <= 9 && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </span>
          </span>
        )}
      </Button>

      {/* Dropdown — Fully Responsive & Accessible */}
      {open && (
        <div
          id="notification-dropdown"
          ref={dropdownRef}
          className="absolute right-0 mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-96 origin-top-right bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notification-trigger"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {hasNotifications && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group disabled:opacity-50"
                role="menuitem"
              >
                <CheckCheck className="w-3 h-3 group-hover:text-indigo-600" />
                Mark all read
              </button>
            )}
          </div>

          {/* Virtualized List */}
          <div
            ref={parentRef}
            className="max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
          >
            {hasNotifications ? (
              <div
                className="relative"
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const n = notifications[virtualRow.index];
                  return (
                    <div
                      key={n.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`group absolute inset-x-0 p-4 border-b border-slate-50 transition-all duration-200 hover:bg-slate-50 ${
                        !n.is_read ? 'bg-indigo-50/30' : ''
                      }`}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      role="menuitem"
                    >
                      {!n.is_read && (
                        <span className="absolute left-0 top-6 h-2 w-1 bg-indigo-500 rounded-r-full" />
                      )}
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <p className={`text-sm leading-snug ${!n.is_read ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        {!n.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead.mutate(n.id);
                            }}
                            disabled={markRead.isPending}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 disabled:opacity-50"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-slate-50 p-3 rounded-full mb-3">
                  <Bell className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">You have no new notifications.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-full text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors py-1"
              role="menuitem"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;