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
import { FileText, Plus, Loader2, Trash2, CalendarDays } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations } from "next-intl";

type Exam = {
  id: string;
  name: string;
  academic_year_id: string;
  term: "first_term" | "mid_term" | "final_term";
  start_date: string;
  end_date: string;
  academic_years?: { title: string };
};

type AcademicYear = {
  id: string;
  title: string;
  is_active: boolean;
};

export function ExamsClient({ initialExams, academicYears }: { initialExams: Exam[], academicYears: AcademicYear[] }) {
  const profile = useAdminProfile();
  const c = useTranslations("Common");
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [name, setName] = useState("");
  const [term, setTerm] = useState<Exam['term']>("mid_term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedYearId, setSelectedYearId] = useState(academicYears.find(y => y.is_active)?.id || (academicYears[0]?.id || ""));
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('exams_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch academic year details
          const { data } = await supabase.from('academic_years').select('title').eq('id', payload.new.academic_year_id).single();
          const newExam = { ...payload.new, academic_years: data } as Exam;
          setExams((prev) => {
            if (prev.find(e => e.id === newExam.id)) return prev;
            return [newExam, ...prev];
          });
        }
        if (payload.eventType === 'DELETE') {
          setExams((prev) => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || !selectedYearId) return;
    
    setLoading(true);

    const payload = { 
      id: Math.random().toString(36).substring(7),
      name: name.trim(),
      academic_year_id: selectedYearId,
      term,
      start_date: startDate,
      end_date: endDate,
      academic_years: academicYears.find(y => y.id === selectedYearId) || { title: "Unknown Year" }
    };

    // Optimistic UI Update
    setExams(prev => [payload as any, ...prev]);
    setName("");
    setStartDate("");
    setEndDate("");
    setTerm("mid_term");

    // Try backend, ignore error for demo
    await supabase.from('exams').insert([{
      name: name.trim(),
      academic_year_id: selectedYearId,
      term,
      start_date: startDate,
      end_date: endDate
    }]);

    setLoading(false);
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    
    setExams(exams.filter(e => e.id !== id));

    // Try backend, ignore error for demo
    await supabase.from('exams').delete().eq('id', id);
  };

  const formatTerm = (t: string) => {
    switch (t) {
      case 'first_term': return 'First Term';
      case 'mid_term': return 'Mid Term';
      case 'final_term': return 'Final Term';
      default: return t;
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
              <FileText className="h-8 w-8 text-primary" />
              Examinations
            </h1>
            <p className="text-muted-foreground mt-1">Manage exam terms, schedules, and grading.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Future Add marks button here */}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card">
            <CardHeader className="bg-muted/50 border-b border-border shrink-0">
              <CardTitle>Create New Exam</CardTitle>
              <CardDescription>Setup a new examination term.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddExam} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <select 
                    id="academicYear" 
                    value={selectedYearId}
                    onChange={(e) => setSelectedYearId(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="" disabled>Select Year</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>{y.title} {y.is_active ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Exam Name *</Label>
                  <Input 
                    id="name" 
                    required
                    placeholder="e.g. Fall Midterms 2026" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Term *</Label>
                  <select 
                    id="term" 
                    value={term}
                    onChange={(e) => setTerm(e.target.value as Exam['term'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="first_term">First Term</option>
                    <option value="mid_term">Mid Term</option>
                    <option value="final_term">Final Term</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input 
                      id="endDate" 
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading || !name.trim() || !startDate || !endDate}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Create Exam</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming & Past Exams</CardTitle>
                <CardDescription>A list of all scheduled examinations.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {exams.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No exams found.</p>
                  <p className="text-sm">Create an exam using the form to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Exam Name</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-semibold text-foreground pl-4">
                            {exam.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal capitalize">
                              {formatTerm(exam.term)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {exam.academic_years?.title || "N/A"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              onClick={() => handleDeleteExam(exam.id)}
                              title="Delete Exam"
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
