"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Loader2, Trash2 } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  content: string;
  target_audience: "all" | "students" | "teachers" | "parents" | "staff";
  is_active: boolean;
  created_at: string;
  profiles?: { full_name: string };
};

export function NoticesClient({ initialNotices }: { initialNotices: Notice[] }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<Notice["target_audience"]>("all");
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  // Sync state if initialNotices changes (e.g. on soft navigation or hot reload)
  useEffect(() => {
    setNotices(initialNotices);
  }, [initialNotices]);

  useEffect(() => {
    const channel = supabase
      .channel('notices_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // fetch profile name (admin) usually would happen, but we can do optimistic update
          setNotices((prev) => {
            if (prev.find(n => n.id === payload.new.id)) return prev;
            return [{...payload.new, profiles: { full_name: "Admin" }} as Notice, ...prev];
          });
        }
        if (payload.eventType === 'DELETE') {
          setNotices((prev) => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);

    const payload = { 
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      target_audience: targetAudience,
      created_at: new Date().toISOString(),
      is_active: true,
      profiles: { full_name: "Admin" }
    };

    setNotices(prev => [payload as Notice, ...prev]);

    const { error } = await supabase.from('notices').insert([{
      title: payload.title,
      content: payload.content,
      target_audience: payload.target_audience
    }]);
    
    if (error) {
      alert("Error posting notice: " + error.message);
    } else {
      setTitle("");
      setContent("");
      setTargetAudience("all");
    }
    setLoading(false);
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    
    const previous = [...notices];
    setNotices(notices.filter(n => n.id !== id));

    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) {
      setNotices(previous);
      alert("Error deleting notice: " + error.message);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">Welcome, Admin</span>
            <span className="text-xs text-muted-foreground">Admin Role</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm cursor-pointer hover:opacity-80 transition">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notice Board
            </h1>
            <p className="text-muted-foreground mt-1">Broadcast announcements to students, staff, and parents.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card">
            <CardHeader className="bg-muted/50 border-b border-border shrink-0">
              <CardTitle>Post Notice</CardTitle>
              <CardDescription>Create a new announcement.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddNotice} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="title">Notice Title *</Label>
                  <Input 
                    id="title" 
                    required
                    placeholder="e.g. Eid Holidays" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <select 
                    id="audience" 
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="all">Everyone</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea 
                    id="content" 
                    required
                    placeholder="Write the details here..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-background min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading || !title.trim() || !content.trim()}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Publish Notice</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {notices.length === 0 ? (
              <Card className="border-border border-dashed shadow-sm">
                <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Bell className="h-12 w-12 mb-4 opacity-20" />
                  <p>No active notices.</p>
                  <p className="text-sm">When you post a notice, it will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              notices.map((notice) => (
                <Card key={notice.id} className="border-border shadow-sm overflow-hidden bg-card transition-all hover:shadow-md group">
                  <CardHeader className="bg-muted/30 border-b border-border py-4 flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize bg-background text-xs font-normal">
                          For: {notice.target_audience}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{notice.title}</CardTitle>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 px-2 transition-colors"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                      {notice.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
