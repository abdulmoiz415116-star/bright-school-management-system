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
import { GraduationCap, Plus, Loader2, Trash2, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAdminProfile } from "@/hooks/useAdminProfile";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  employee_id?: string;
  cnic?: string;
  phone_number?: string;
  qualification?: string;
  experience?: string;
  joining_date?: string;
  salary?: string;
  bank_account?: string;
  created_at: string;
};

export function TeachersClient({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const t = useTranslations("Teachers");
  const c = useTranslations("Common");
  const profile = useAdminProfile();
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    name: "", subject: "", employee_id: "", cnic: "", phone_number: "",
    qualification: "", experience: "", joining_date: "", salary: "", bank_account: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const channel = supabase
      .channel('teachers_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTeachers((prev) => {
            if (prev.find(t => t.id === payload.new.id)) return prev;
            return [payload.new as Teacher, ...prev];
          });
        }
        if (payload.eventType === 'UPDATE') {
          setTeachers((prev) => prev.map(t => t.id === payload.new.id ? payload.new as Teacher : t));
        }
        if (payload.eventType === 'DELETE') {
          setTeachers((prev) => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name || "",
      subject: teacher.subject || "",
      employee_id: teacher.employee_id || "",
      cnic: teacher.cnic || "",
      phone_number: teacher.phone_number || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      joining_date: teacher.joining_date || "",
      salary: teacher.salary || "",
      bank_account: teacher.bank_account || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "", subject: "", employee_id: "", cnic: "", phone_number: "",
      qualification: "", experience: "", joining_date: "", salary: "", bank_account: ""
    });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim()) return;
    
    setLoading(true);

    const payload: Record<string, any> = { ...formData };
    if (payload.joining_date === "") payload.joining_date = null;
    if (payload.salary === "") payload.salary = null;

    if (editingId) {
      setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...payload } : t));
      await supabase.from('teachers').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      const newRecord = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      setTeachers([newRecord as Teacher, ...teachers]);
      await supabase.from('teachers').insert([payload]);
    }

    setFormData({
      name: "", subject: "", employee_id: "", cnic: "", phone_number: "",
      qualification: "", experience: "", joining_date: "", salary: "", bank_account: ""
    });
    
    setLoading(false);
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;
    if (editingId === id) handleCancelEdit();
    
    setTeachers(teachers.filter(t => t.id !== id));
    await supabase.from('teachers').delete().eq('id', id);
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
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
              <GraduationCap className="h-8 w-8 text-primary" />
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
          {/* Add / Edit Teacher Form */}
          <Card className={`lg:col-span-1 border-border shadow-sm h-[800px] flex flex-col bg-card ${editingId ? 'ring-2 ring-blue-500/50' : ''}`}>
            <CardHeader className="bg-muted/50 border-b border-border shrink-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? "Edit Teacher Record" : t("registerTeacher")}</CardTitle>
                <CardDescription>{editingId ? "Update details for this faculty member" : t("enterDetails")}</CardDescription>
              </div>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} title="Cancel Editing">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto flex-1">
              <form onSubmit={handleAddTeacher} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input id="name" required value={formData.name} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">{t("employeeId")}</Label>
                    <Input id="employee_id" value={formData.employee_id} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">{t("cnic")}</Label>
                    <Input id="cnic" value={formData.cnic} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t("subjectAssigned")}</Label>
                  <select id="subject" required value={formData.subject} onChange={handleInputChange} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="" disabled>{t("selectSubject")}</option>
                    <option value={t("urdu")}>{t("urdu")}</option><option value={t("english")}>{t("english")}</option>
                    <option value={t("math")}>{t("math")}</option><option value={t("science")}>{t("science")}</option>
                    <option value={t("physics")}>{t("physics")}</option><option value={t("chemistry")}>{t("chemistry")}</option>
                    <option value={t("bio")}>{t("bio")}</option><option value={t("islamiat")}>{t("islamiat")}</option>
                    <option value={t("nazra")}>{t("nazra")}</option><option value={t("arabi")}>{t("arabi")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{t("phoneNo")}</Label>
                    <Input id="phone_number" value={formData.phone_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">{t("joiningDate")}</Label>
                    <Input type="date" id="joining_date" value={formData.joining_date} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">{t("qualification")}</Label>
                    <Input id="qualification" placeholder="e.g. MS Physics" value={formData.qualification} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">{t("experience")}</Label>
                    <Input id="experience" placeholder="e.g. 5 Years" value={formData.experience} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="salary">{t("salary")}</Label>
                    <Input type="number" id="salary" value={formData.salary} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account">{t("bankAccount")}</Label>
                    <Input id="bank_account" value={formData.bank_account} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading || !formData.name.trim() || !formData.subject.trim()}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingId ? "Updating..." : t("adding")}</>
                    ) : editingId ? (
                      <><Pencil className="mr-2 h-4 w-4" /> Update Teacher</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" /> {t("addTeacher")}</>
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

          {/* Teachers List Table */}
          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("teachingStaff")}</CardTitle>
                <CardDescription>{t("staffDesc")}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {t("total")} {teachers.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {teachers.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>{t("noTeachers")}</p>
                  <p className="text-sm">{t("addTeacherDesc")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px] pl-4">{t("empId")}</TableHead>
                        <TableHead>{t("teacherName")}</TableHead>
                        <TableHead>{t("subject")}</TableHead>
                        <TableHead>{t("phoneQual")}</TableHead>
                        <TableHead className="text-right pr-4">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher) => (
                        <TableRow key={teacher.id} className={`group hover:bg-muted/50 transition-colors ${editingId === teacher.id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}>
                          <TableCell className="font-medium text-muted-foreground pl-4">
                            {teacher.employee_id || `#${teacher.id}`}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">{teacher.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <Badge variant="outline" className="font-normal bg-background">{teacher.subject}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <p>{teacher.phone_number || '-'}</p>
                            <p className="text-xs opacity-70">{teacher.qualification}</p>
                          </TableCell>
                          <TableCell className="text-right pr-4 flex items-center justify-end gap-1.5">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => handleEditTeacher(teacher)}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 px-2 transition-colors"
                              onClick={() => handleDeleteTeacher(teacher.id)}
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

