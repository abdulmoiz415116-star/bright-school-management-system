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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Loader2, Trash2, Home } from "lucide-react";

type Hostel = {
  id: string;
  name: string;
  type: string;
  warden_name: string;
  warden_phone: string;
};

export function HostelClient({ initialHostels }: { initialHostels: Hostel[] }) {
  const [hostels, setHostels] = useState<Hostel[]>(initialHostels);
  const [name, setName] = useState("");
  const [type, setType] = useState("Boys");
  const [wardenName, setWardenName] = useState("");
  const [wardenPhone, setWardenPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('hostels_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hostels' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setHostels((prev) => {
            if (prev.find(h => h.id === payload.new.id)) return prev;
            return [...prev, payload.new as Hostel];
          });
        }
        if (payload.eventType === 'DELETE') {
          setHostels((prev) => prev.filter(h => h.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type) return;
    
    setLoading(true);

    const payload = { 
      name: name.trim(),
      type,
      warden_name: wardenName.trim(),
      warden_phone: wardenPhone.trim()
    };

    const { error } = await supabase.from('hostels').insert([payload]);
    
    if (error) {
      alert("Error adding hostel: " + error.message);
    } else {
      setName("");
      setType("Boys");
      setWardenName("");
      setWardenPhone("");
    }
    setLoading(false);
  };

  const handleDeleteHostel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel?")) return;
    
    const previous = [...hostels];
    setHostels(hostels.filter(h => h.id !== id));

    const { error } = await supabase.from('hostels').delete().eq('id', id);
    if (error) {
      setHostels(previous);
      alert("Error deleting hostel: " + error.message);
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
              <Building className="h-8 w-8 text-primary" />
              Hostel Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage hostels, rooms, and allocations.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card">
            <CardHeader className="bg-muted/50 border-b border-border shrink-0">
              <CardTitle>Add New Hostel</CardTitle>
              <CardDescription>Register a new hostel facility.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddHostel} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="name">Hostel Name *</Label>
                  <Input 
                    id="name" 
                    required
                    placeholder="e.g. Jinnah Hall" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Hostel Type *</Label>
                  <select 
                    id="type" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wardenName">Warden Name</Label>
                  <Input 
                    id="wardenName" 
                    placeholder="e.g. Tariq Jamil" 
                    value={wardenName}
                    onChange={(e) => setWardenName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wardenPhone">Warden Phone</Label>
                  <Input 
                    id="wardenPhone" 
                    placeholder="e.g. 0300-1234567" 
                    value={wardenPhone}
                    onChange={(e) => setWardenPhone(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading || !name.trim()}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Add Hostel</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hostel Facilities</CardTitle>
                <CardDescription>List of all registered hostels.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {hostels.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No hostels found.</p>
                  <p className="text-sm">Add a hostel using the form to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Hostel Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Warden Details</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hostels.map((hostel) => (
                        <TableRow key={hostel.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="pl-4">
                            <p className="font-semibold text-foreground">{hostel.name}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {hostel.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{hostel.warden_name || "N/A"}</span>
                              <span className="text-xs text-muted-foreground">{hostel.warden_phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              onClick={() => handleDeleteHostel(hostel.id)}
                              title="Delete Hostel"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
