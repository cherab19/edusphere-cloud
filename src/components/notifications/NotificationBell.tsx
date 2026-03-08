import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

const typeIcon: Record<string, string> = {
  announcement: "📢",
  fee_reminder: "💰",
  attendance: "📋",
  grade: "📊",
  general: "🔔",
};

const NotificationBell = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").delete().eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 rounded-lg" onClick={() => markAllRead.mutate()}>
                <CheckCheck className="w-3 h-3" /> Read all
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 rounded-lg text-destructive" onClick={() => clearAll.mutate()}>
                <Trash2 className="w-3 h-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium truncate", !n.read && "text-foreground", n.read && "text-muted-foreground")}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
