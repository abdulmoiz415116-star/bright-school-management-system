"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Printer } from "lucide-react";

type ResultsClientProps = {
  classes: any[];
  exams: any[];
  students: any[];
  marksData: any[];
};

export function ResultsClient({ classes, exams, students, marksData: initialMarks }: ResultsClientProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [marksData, setMarksData] = useState(initialMarks);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('results_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_marks' }, async (payload) => {
        // Re-fetch all marks to ensure we have the joined data
        const { data } = await supabase
          .from('exam_marks')
          .select(`
            id,
            marks_obtained,
            is_absent,
            student_id,
            exam_schedules (
              exam_id,
              max_marks,
              subjects (name)
            )
          `);
        if (data) setMarksData(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredStudents = students.filter(s => s.class_id === selectedClassId);

  // Group marks by student and then by subject for the selected exam
  const studentResults = filteredStudents.map(student => {
    const studentMarks = marksData.filter(m => m.student_id === student.id && m.exam_schedules?.exam_id === selectedExamId);
    
    let totalObtained = 0;
    let totalMax = 0;
    const subjects: any[] = [];

    studentMarks.forEach(m => {
      const maxMarks = m.exam_schedules?.max_marks || 100;
      const obtained = m.is_absent ? 0 : (m.marks_obtained || 0);
      totalMax += maxMarks;
      totalObtained += obtained;
      
      subjects.push({
        name: m.exam_schedules?.subjects?.name,
        max: maxMarks,
        obtained: obtained,
        is_absent: m.is_absent
      });
    });

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : "0.00";
    
    let grade = "F";
    const p = parseFloat(percentage);
    if (p >= 85) grade = "A+";
    else if (p >= 70) grade = "A";
    else if (p >= 60) grade = "B";
    else if (p >= 50) grade = "C";
    else if (p >= 40) grade = "D";

    return {
      ...student,
      totalObtained,
      totalMax,
      percentage,
      grade,
      subjects
    };
  });

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">Welcome, Teacher</span>
            <span className="text-xs text-muted-foreground">Staff Role</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm cursor-pointer hover:opacity-80 transition">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>TR</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <FileBarChart className="h-8 w-8 text-primary" />
              Results & Report Cards
            </h1>
            <p className="text-muted-foreground mt-1">Generate and view class results.</p>
          </div>
        </div>

        <Card className="border-border shadow-sm bg-card mb-8">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Select a class and exam to generate results.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Select Class *</Label>
              <select 
                id="class" 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exam">Select Exam *</Label>
              <select 
                id="exam" 
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Select Exam --</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.term})</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {selectedClassId && selectedExamId && (
          <Card className="border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Result Sheet</CardTitle>
                <CardDescription>Overview of student performances.</CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" /> Print Reports
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {studentResults.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p>No students found in this class.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Roll Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentResults.map((student) => (
                        <TableRow key={student.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium pl-4">{student.roll_number}</TableCell>
                          <TableCell className="font-semibold text-foreground">{student.profiles?.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.totalObtained} / {student.totalMax}
                          </TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(student.percentage) >= 50 ? "default" : "destructive"}>
                              {student.percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-primary">
                            {student.grade}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
