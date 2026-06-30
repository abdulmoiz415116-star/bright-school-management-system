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
import { UserPlus, Plus, Loader2, Trash2, KeyRound, MessageCircle, Pencil, X } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useTranslations } from "next-intl";
import { useAdminProfile } from "@/hooks/useAdminProfile";

type Parent = {
  id: number;
  father_name: string;
  mother_name?: string;
  phone_number: string;
  cnic?: string;
  email?: string;
  address?: string;
  occupation?: string;
  created_at: string;
};

export function ParentsClient({ initialParents }: { initialParents: Parent[] }) {
  const t = useTranslations("Parents");
  const c = useTranslations("Common");
  const profile = useAdminProfile();
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    father_name: "", mother_name: "", phone_number: "",
    cnic: "", email: "", address: "", occupation: "", password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const channel = supabase
      .channel('parents_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParents((prev) => {
            if (prev.find(p => p.id === payload.new.id)) return prev;
            return [payload.new as Parent, ...prev];
          });
        }
        if (payload.eventType === 'UPDATE') {
          setParents((prev) => prev.map(p => p.id === payload.new.id ? payload.new as Parent : p));
        }
        if (payload.eventType === 'DELETE') {
          setParents((prev) => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleEditParent = (parent: Parent) => {
    setEditingId(parent.id);
    setFormData({
      father_name: parent.father_name || "",
      mother_name: parent.mother_name || "",
      phone_number: parent.phone_number || "",
      cnic: parent.cnic || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      password: "••••••••"
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      father_name: "", mother_name: "", phone_number: "",
      cnic: "", email: "", address: "", occupation: "", password: ""
    });
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.father_name.trim() || !formData.phone_number.trim()) return;
    
    setLoading(true);

    const dbPayload = {
      father_name: formData.father_name,
      mother_name: formData.mother_name,
      phone_number: formData.phone_number,
      cnic: formData.cnic,
      email: formData.email,
      address: formData.address,
      occupation: formData.occupation
    };

    if (editingId) {
      setParents(parents.map(p => p.id === editingId ? { ...p, ...dbPayload } : p));
      await supabase.from('parents').update(dbPayload).eq('id', editingId);
      setEditingId(null);
    } else {
      const newRecord = { ...dbPayload, id: Date.now(), created_at: new Date().toISOString() };
      setParents(prev => [newRecord as Parent, ...prev]);
      await supabase.from('parents').insert([dbPayload]);
    }

    setFormData({
      father_name: "", mother_name: "", phone_number: "",
      cnic: "", email: "", address: "", occupation: "", password: ""
    });
    
    setLoading(false);
  };

  const handleDeleteParent = async (id: number) => {
    if (!confirm("Are you sure you want to remove this parent account?")) return;
    if (editingId === id) handleCancelEdit();
    
    setParents(parents.filter(p => p.id !== id));
    await supabase.from('parents').delete().eq('id', id);
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <NotificationBell />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">{profile.firstName} {profile.lastName}</span>
            <span className="text-xs text-muted-foreground">{c("superAdmin")}</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm cursor-pointer hover:opacity-80 transition">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("description")}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-sm">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            {t("realtimeSync")}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add / Edit Parent Form */}
          <Card className={`lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card ${editingId ? 'ring-2 ring-blue-500/50' : ''}`}>
            <CardHeader className="bg-muted/50 border-b border-border shrink-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? "Edit Parent Account" : t("createAccount")}</CardTitle>
                <CardDescription>{editingId ? "Update account information for this parent" : t("createDesc")}</CardDescription>
              </div>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} title="Cancel Editing">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddParent} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="father_name">{t("fatherName")}</Label>
                  <Input id="father_name" required value={formData.father_name} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother_name">{t("motherName")}</Label>
                  <Input id="mother_name" value={formData.mother_name} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{t("phoneNo")}</Label>
                    <Input id="phone_number" required placeholder="0300-1234567" value={formData.phone_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">{t("cnic")}</Label>
                    <Input id="cnic" placeholder="12345-1234567-1" value={formData.cnic} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input id="email" type="email" placeholder="Optional" value={formData.email} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">{t("occupation")}</Label>
                  <Input id="occupation" value={formData.occupation} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input id="address" value={formData.address} onChange={handleInputChange} className="bg-background"/>
                </div>

                {!editingId && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label htmlFor="password" className="flex items-center gap-2 text-primary">
                      <KeyRound className="w-4 h-4" /> {t("password")}
                    </Label>
                    <Input id="password" type="password" required placeholder="***" value={formData.password} onChange={handleInputChange} className="bg-background"/>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading || !formData.father_name.trim() || !formData.phone_number.trim()}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingId ? "Updating..." : t("creating")}</>
                    ) : editingId ? (
                      <><Pencil className="mr-2 h-4 w-4" /> Update Parent</>
                    ) : (
                      <><UserPlus className="mr-2 h-4 w-4" /> {t("createBtn")}</>
                    )}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Parents List Table */}
          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("registeredParents")}</CardTitle>
                <CardDescription>{t("registeredDesc")}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {t("total")} {parents.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {parents.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>{t("noParents")}</p>
                  <p className="text-sm">{t("addParentDesc")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">{t("fatherNameCol")}</TableHead>
                        <TableHead>{t("phoneCol")}</TableHead>
                        <TableHead>{t("emailCnicCol")}</TableHead>
                        <TableHead>{t("occupationCol")}</TableHead>
                        <TableHead className="text-right pr-4">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parents.map((parent) => (
                        <TableRow key={parent.id} className={`group hover:bg-muted/50 transition-colors ${editingId === parent.id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}>
                          <TableCell className="font-semibold text-foreground pl-4">{parent.father_name}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {parent.phone_number}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <div className="flex flex-col">
                              <span>{parent.email || t("noEmail")}</span>
                              <span className="text-xs opacity-70">{parent.cnic || t("noCnic")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {parent.occupation || '-'}
                          </TableCell>
                          <TableCell className="text-right pr-4 flex items-center justify-end gap-1.5">
                            <a 
                              href={`https://wa.me/${parent.phone_number.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/50 mr-1"
                              title={t("whatsapp")}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => handleEditParent(parent)}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 px-2 transition-colors"
                              onClick={() => handleDeleteParent(parent.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
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

