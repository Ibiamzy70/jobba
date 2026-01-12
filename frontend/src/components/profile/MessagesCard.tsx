// src/components/MessagesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { MessageSquare, Inbox, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import { useCallback } from "react";
import { useMessages, useMarkMessageRead } from "../../hooks/use-messages";
import { useNavigate } from "react-router-dom";
import type { components } from "../../types/api-schema";

type Message = components["schemas"]["Message"];

export default function MessagesCard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const markReadMutation = useMarkMessageRead();

  const { data, isFetching } = useMessages({ ordering: "-created_at" });
  const messages = data?.results.slice(0, 5) || [];
  const unreadCount = messages.filter(m => !m.is_read).length;
  const isMutating = markReadMutation.isPending;

  const handleViewMessage = useCallback(async (id: number) => {
    try {
      await markReadMutation.mutateAsync(id);
      navigate(`/messages/${id}`);
    } catch {
      toast({ title: "Failed to open message", variant: "destructive" });
    }
  }, [markReadMutation, navigate, toast]);

  const handleViewAll = useCallback(() => {
    navigate("/messages");
  }, [navigate]);

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
          <MessageSquare className="h-6 w-6 text-indigo-600" />
          <CardTitle>Messages</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold animate-pulse">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All →
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isFetching ? (
          <div className="py-20 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 px-6">
            <Inbox className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-semibold text-foreground">Inbox empty</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Messages from recruiters will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative p-4 rounded-2xl border border-transparent hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 transition-all cursor-pointer"
                  onClick={() => handleViewMessage(msg.id)}
                  role="article"
                  aria-labelledby={`message-title-${msg.id}`}
                >
                  {!msg.is_read && (
                    <div className="absolute top-4 right-4">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                      </span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
                      <AvatarImage src={msg.sender_avatar_url || undefined} />
                      <AvatarFallback className="font-bold">
                        {(msg.sender_name ?? "??").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4
                        id={`message-title-${msg.id}`}
                        className={`text-sm font-semibold truncate ${!msg.is_read ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {msg.sender_name}
                      </h4>
                      {msg.subject && (
                        <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">
                          {msg.subject}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/80 truncate mt-1">
                        {msg.preview}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}