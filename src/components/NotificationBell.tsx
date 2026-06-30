"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Notice = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export function NotificationBell() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial latest 5 notices
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (data) {
        setNotices(data);
      }
    };

    fetchNotices();

    // Subscribe to new notices
    const channel = supabase
      .channel("realtime-notices")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notices" },
        (payload) => {
          setNotices((prev) => [payload.new as Notice, ...prev].slice(0, 5));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleOpen = (open: boolean) => {
    if (open) {
      setUnreadCount(0);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-muted/60 transition-colors focus:outline-none flex items-center justify-center">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/50 shadow-xl backdrop-blur-xl bg-background/95">
        <DropdownMenuLabel className="font-semibold px-4 py-3">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="max-h-[300px] overflow-y-auto">
          {notices.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No new notifications.
            </div>
          ) : (
            notices.map((notice) => (
              <DropdownMenuItem 
                key={notice.id} 
                className="flex flex-col items-start px-4 py-3 gap-1 cursor-pointer hover:bg-muted/50 rounded-none border-b border-border/20 last:border-0 focus:bg-muted/50"
              >
                <span className="font-semibold text-sm text-foreground">{notice.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-2 text-left">{notice.content}</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
                  {new Date(notice.created_at).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
