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
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Loader2, Save } from "lucide-react";

type Schedule = {
  id: string;
  exam_date: string;
  max_marks: number;
  exams: any;
  classes: any;
  subjects: any;
};

type Student = {
  id: string;
  roll_number: string;
  class_id: string;
  profiles: any;
};

export function MarksClient({ schedules, allStudents }: { schedules: Schedule[], allStudents: Student[] }) {
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [marksData, setMarksData] = useState<Record<string, { marks: string, is_absent: boolean, remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const supabase = createClient();

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);
  const filteredStudents = allStudents.filter(s => s.class_id === selectedSchedule?.classes?.id);

  const loadExistingMarks = async (scheduleId: string) => {
    setFetchLoading(true);
    const { data, error } = await supabase
      .from('exam_marks')
      .select('*')
      .eq('exam_schedule_id', scheduleId);
    
    if (!error && data) {
      const existing: Record<string, any> = {};
      data.forEach(mark => {
        existing[mark.student_id] = {
          marks: mark.marks_obtained !== null ? mark.marks_obtained.toString() : "",
          is_absent: mark.is_absent,
          remarks: mark.remarks || ""
        };
      });
      setMarksData(existing);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    if (!selectedScheduleId) return;
    
    const channel = supabase
      .channel('marks_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_marks', filter: `exam_schedule_id=eq.${selectedScheduleId}` }, (payload) => {
        // Re-fetch marks when someone else updates them
        loadExistingMarks(selectedScheduleId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedScheduleId, supabase]);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedScheduleId(id);
    if (id) {
      loadExistingMarks(id);
    } else {
      setMarksData({});
    }
  };

  const handleMarkChange = (studentId: string, field: string, value: any) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedScheduleId) return;
    setLoading(true);

    const payload = filteredStudents.map(student => {
      const data = marksData[student.id] || { marks: "", is_absent: false, remarks: "" };
      return {
        exam_schedule_id: selectedScheduleId,
        student_id: student.id,
        marks_obtained: data.marks ? parseFloat(data.marks) : null,
        is_absent: data.is_absent || false,
        remarks: data.remarks || ""
      };
    });

    // Upsert marks
    const { error } = await supabase.from('exam_marks').upsert(payload, { onConflict: 'exam_schedule_id,student_id' });

    if (error) {
      alert("Error saving marks: " + error.message);
    } else {
      alert("Marks saved successfully!");
    }
    setLoading(false);
  };

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
              <CheckCircle className="h-8 w-8 text-primary" />
              Marks Entry
            </h1>
            <p className="text-muted-foreground mt-1">Enter marks for exams and assessments.</p>
          </div>
        </div>

        <Card className="border-border shadow-sm bg-card mb-8">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle>Select Examination</CardTitle>
            <CardDescription>Choose the schedule you want to enter marks for.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-w-md space-y-2">
              <Label htmlFor="schedule">Exam Schedule *</Label>
              <select 
                id="schedule" 
                value={selectedScheduleId}
                onChange={handleScheduleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Select Exam Schedule --</option>
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.exams?.name} - {s.classes?.name} - {s.subjects?.name} ({new Date(s.exam_date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {selectedScheduleId && (
          <Card className="border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Students List - {selectedSchedule?.classes?.name}</CardTitle>
                <CardDescription>
                  Subject: <span className="font-semibold text-foreground">{selectedSchedule?.subjects?.name}</span> | 
                  Max Marks: <span className="font-semibold text-foreground">{selectedSchedule?.max_marks}</span>
                </CardDescription>
              </div>
              <Button onClick={handleSaveMarks} disabled={loading || fetchLoading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Marks</>}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {fetchLoading ? (
                <div className="p-12 text-center text-muted-foreground flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading student marks...
                </div>
              ) : filteredStudents.length === 0 ? (
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
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Absent?</TableHead>
                        <TableHead className="pr-4">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const data = marksData[student.id] || { marks: "", is_absent: false, remarks: "" };
                        return (
                          <TableRow key={student.id} className="group hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium pl-4">{student.roll_number}</TableCell>
                            <TableCell className="font-semibold text-foreground">{student.profiles.full_name}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                className="w-24 bg-background" 
                                placeholder="0"
                                value={data.marks}
                                disabled={data.is_absent}
                                onChange={(e) => handleMarkChange(student.id, 'marks', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`absent-${student.id}`} 
                                  checked={data.is_absent}
                                  onCheckedChange={(checked) => handleMarkChange(student.id, 'is_absent', !!checked)}
                                />
                                <Label htmlFor={`absent-${student.id}`} className="cursor-pointer">Absent</Label>
                              </div>
                            </TableCell>
                            <TableCell className="pr-4">
                              <Input 
                                type="text" 
                                className="bg-background w-full" 
                                placeholder="Optional remarks"
                                value={data.remarks}
                                onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
