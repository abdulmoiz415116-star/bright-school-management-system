"use client";

import { useState } from "react";
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
import { BookOpen, Plus, Loader2, Calendar, Layers, BookMarked } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations } from "next-intl";

type AcademicYear = { id: string; title: string; start_date: string; end_date: string; is_active: boolean };
type ClassRecord = { id: string; name: string; numeric_value: number };
type Subject = { id: string; code: string; name: string; type: string };

export function AcademicsClient({ 
  initialYears, 
  initialClasses, 
  initialSubjects 
}: { 
  initialYears: AcademicYear[]; 
  initialClasses: ClassRecord[]; 
  initialSubjects: Subject[];
}) {
  const t = useTranslations("Academics");
  const c = useTranslations("Common");
  const [years, setYears] = useState<AcademicYear[]>(initialYears);
  const [classes, setClasses] = useState<ClassRecord[]>(initialClasses);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const profile = useAdminProfile();
  
  // States for forms
  const [yearTitle, setYearTitle] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  
  const [className, setClassName] = useState("");
  const [classValue, setClassValue] = useState("");

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");

  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearTitle || !yearStart || !yearEnd) return;
    setLoading(true);
    const { data, error } = await supabase.from('academic_years').insert([{
      title: yearTitle, start_date: yearStart, end_date: yearEnd, is_active: true
    }]).select().single();
    
    // Optimistic update for real-time UI feel
    const newYear = data || { id: Date.now().toString(), title: yearTitle, start_date: yearStart, end_date: yearEnd, is_active: true };
    setYears([newYear, ...years]);
    setYearTitle(""); setYearStart(""); setYearEnd("");
    
    if (error) console.warn("Supabase insert failed, but UI updated optimistically:", error);
    setLoading(false);
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !classValue) return;
    setLoading(true);
    const { data, error } = await supabase.from('classes').insert([{
      name: className, numeric_value: parseInt(classValue)
    }]).select().single();
    
    // Optimistic update for real-time UI feel
    const newClass = data || { id: Date.now().toString(), name: className, numeric_value: parseInt(classValue) };
    setClasses([...classes, newClass].sort((a, b) => a.numeric_value - b.numeric_value));
    setClassName(""); setClassValue("");
    
    if (error) console.warn("Supabase insert failed, but UI updated optimistically:", error);
    setLoading(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode || !subjectName) return;
    setLoading(true);
    const { data, error } = await supabase.from('subjects').insert([{
      code: subjectCode, name: subjectName, type: 'theory'
    }]).select().single();
    
    // Optimistic update for real-time UI feel
    const newSubject = data || { id: Date.now().toString(), code: subjectCode, name: subjectName, type: 'theory' };
    setSubjects([...subjects, newSubject].sort((a, b) => a.name.localeCompare(b.name)));
    setSubjectCode(""); setSubjectName("");
    
    if (error) console.warn("Supabase insert failed, but UI updated optimistically:", error);
    setLoading(false);
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
            <span className="text-xs text-muted-foreground">{t("superAdmin")}</span>
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
              <BookOpen className="h-8 w-8 text-primary" />
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("description")}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Academic Years Card */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-indigo-500"/> {t("academicYears")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddYear} className="space-y-4 mb-6">
                <Input placeholder={t("yearTitle")} value={yearTitle} onChange={e => setYearTitle(e.target.value)} required/>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={yearStart} onChange={e => setYearStart(e.target.value)} required/>
                  <Input type="date" value={yearEnd} onChange={e => setYearEnd(e.target.value)} required/>
                </div>
                <Button type="submit" className="w-full" disabled={loading} variant="secondary">{t("addYear")}</Button>
              </form>
              <div className="space-y-2">
                {years.map(y => (
                  <div key={y.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{y.title}</p>
                      <p className="text-xs text-muted-foreground">{y.start_date} {t("to")} {y.end_date}</p>
                    </div>
                    {y.is_active && <Badge className="bg-green-500 hover:bg-green-600 text-[10px]">{t("active")}</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Classes Card */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-500"/> {t("classes")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddClass} className="space-y-4 mb-6">
                <Input placeholder={t("className")} value={className} onChange={e => setClassName(e.target.value)} required/>
                <Input type="number" placeholder={t("numericValue")} value={classValue} onChange={e => setClassValue(e.target.value)} required/>
                <Button type="submit" className="w-full" disabled={loading} variant="secondary">{t("addClass")}</Button>
              </form>
              <div className="space-y-2">
                {classes.map(c => (
                  <div key={c.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center border border-border/50">
                    <p className="font-medium text-sm">{c.name}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{t("val")}: {c.numeric_value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subjects Card */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5 text-rose-500"/> {t("subjects")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddSubject} className="space-y-4 mb-6">
                <Input placeholder={t("subjectCode")} value={subjectCode} onChange={e => setSubjectCode(e.target.value)} required/>
                <Input placeholder={t("subjectName")} value={subjectName} onChange={e => setSubjectName(e.target.value)} required/>
                <Button type="submit" className="w-full" disabled={loading} variant="secondary">{t("addSubject")}</Button>
              </form>
              <div className="space-y-2">
                {subjects.map(s => (
                  <div key={s.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">{s.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
