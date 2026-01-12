import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  BellOff,
  Briefcase,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Eye,
  UserCheck,
  Star,
  Loader2,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../hooks/useNotifications";
import type { components } from "../../types/api-schema";

type Notification = components["schemas"]["Notification"];

const notificationIcons: Record<Notification["type"], any> = {
  job_offer: Briefcase,
  application_accepted: CheckCircle2,
  application_rejected: XCircle,
  new_message: MessageSquare,
  profile_view: Eye,
  profile_match: UserCheck,
  featured: Star,
};

export default function NotificationsCard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const { data, isFetching } = useNotifications({ ordering: "-created_at" });
  const notifications = data?.results.slice(0, 8) || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isMutating = markReadMutation.isPending || markAllMutation.isPending;

  const handleMarkRead = useCallback(async (id: number) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch {
      toast({ title: "Failed to mark as read", variant: "destructive" });
    }
  }, [markReadMutation, toast]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllMutation.mutateAsync();
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ title: "Failed to mark all as read", variant: "destructive" });
    }
  }, [markAllMutation, toast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMarkRead(id);
    }
  }, [handleMarkRead]);

  const getIcon = (type: Notification["type"]) => notificationIcons[type] || Bell;

  const getIconColor = (type: Notification["type"]) => {
    const colors: Record<Notification["type"], string> = {
      application_accepted: "text-emerald-600",
      application_rejected: "text-destructive",
      job_offer: "text-indigo-600",
      new_message: "text-blue-600",
      featured: "text-amber-600",
      profile_view: "text-purple-600",
      profile_match: "text-pink-600",
    };
    return colors[type] || "text-muted-foreground";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-indigo-600" />
          <CardTitle>Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold animate-pulse">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMutating}
              className="text-xs"
            >
              {markAllMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5 mr-1" />
              )}
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
            View All →
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isFetching ? (
          <div className="py-20 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 px-6">
            <BellOff className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-semibold text-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You're up to date with everything
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {notifications.map((n, i) => {
                const Icon = getIcon(n.type);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 200 }}
                    className="group relative p-5 rounded-2xl border border-transparent hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 transition-all"
                    role="button"
                    tabIndex={0}
                    aria-label={`Notification: ${n.title}`}
                    onClick={() => handleMarkRead(n.id)}
                    onKeyDown={(e) => handleKeyDown(e, n.id)}
                  >
                    {!n.is_read && (
                      <div className="absolute top-5 right-5">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                        </span>
                      </div>
                    )}

                    <div className="flex gap-5">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${getIconColor(n.type)} bg-current/10`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-foreground ${!n.is_read ? "font-bold" : ""}`}>
                          {n.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}