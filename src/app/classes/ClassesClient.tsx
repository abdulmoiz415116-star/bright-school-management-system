"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { GraduationCap, Users, Printer, Search, BookOpen, User, ShieldCheck, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Student = {
  id: number;
  name: string;
  admission_number?: string;
  roll_number?: string;
  father_name?: string;
  class_name?: string;
  gender?: string;
  dob?: string;
  blood_group?: string;
  mobile_number?: string;
  address?: string;
};

type ClassConfig = {
  id: string;
  name: string;
  numeric_value: number;
};

export function ClassesClient({ 
  initialStudents = [], 
  initialClasses = [] 
}: { 
  initialStudents: Student[];
  initialClasses: ClassConfig[];
}) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';

  const defaultClasses: ClassConfig[] = [
    { id: '1', name: 'Playgroup', numeric_value: -2 },
    { id: '2', name: 'Nursery', numeric_value: -1 },
    { id: '3', name: 'Prep/KG', numeric_value: 0 },
    { id: '4', name: 'Grade 1', numeric_value: 1 },
    { id: '5', name: 'Grade 2', numeric_value: 2 },
    { id: '6', name: 'Grade 3', numeric_value: 3 },
    { id: '7', name: 'Grade 4', numeric_value: 4 },
    { id: '8', name: 'Grade 5', numeric_value: 5 },
    { id: '9', name: 'Grade 6', numeric_value: 6 },
    { id: '10', name: 'Grade 7', numeric_value: 7 },
    { id: '11', name: 'Grade 8', numeric_value: 8 },
    { id: '12', name: 'Grade 9', numeric_value: 9 },
    { id: '13', name: 'Grade 10', numeric_value: 10 }
  ];

  const classesList = initialClasses.length > 0 ? initialClasses : defaultClasses;

  const dummyStudents: Student[] = [
    { id: 9901, name: 'Muhammad Ali Raza', admission_number: 'ADM-1001', roll_number: 'NUR-01', father_name: 'Tariq Mahmood', dob: '2019-05-15', gender: 'Male', blood_group: 'B+', address: 'Gulberg 3, Lahore', mobile_number: '0300-1234567', class_name: 'Nursery' },
    { id: 9902, name: 'Syeda Fatima Zahra', admission_number: 'ADM-1002', roll_number: 'KG-05', father_name: 'Syed Hassan Shah', dob: '2018-08-20', gender: 'Female', blood_group: 'O+', address: 'DHA Phase 5, Lahore', mobile_number: '0321-9876543', class_name: 'Prep/KG' },
    { id: 9903, name: 'Zainab Binte Bilal', admission_number: 'ADM-1003', roll_number: 'G1-12', father_name: 'Bilal Ahmad', dob: '2017-12-10', gender: 'Female', blood_group: 'A+', address: 'Johar Town, Lahore', mobile_number: '0301-5554433', class_name: 'Grade 1' },
    { id: 9904, name: 'Hamza Tariq', admission_number: 'ADM-1004', roll_number: 'G2-08', father_name: 'Tariq Mahmood', dob: '2016-03-25', gender: 'Male', blood_group: 'AB+', address: 'Model Town, Lahore', mobile_number: '0333-1122334', class_name: 'Grade 2' },
    { id: 9905, name: 'Ayesha Omer', admission_number: 'ADM-1005', roll_number: 'G3-15', father_name: 'Omer Farooq', dob: '2015-11-05', gender: 'Female', blood_group: 'O-', address: 'Faisal Town, Lahore', mobile_number: '0302-9988776', class_name: 'Grade 3' },
    { id: 9906, name: 'Ibrahim Khalid', admission_number: 'ADM-1006', roll_number: 'G4-02', father_name: 'Khalid Pervez', dob: '2014-07-12', gender: 'Male', blood_group: 'B-', address: 'Cantt, Lahore', mobile_number: '0305-4433221', class_name: 'Grade 4' },
    { id: 9907, name: 'Maryam Sajid', admission_number: 'ADM-1007', roll_number: 'G5-19', father_name: 'Sajid Ali', dob: '2013-02-18', gender: 'Female', blood_group: 'A-', address: 'Garden Town, Lahore', mobile_number: '0312-7766554', class_name: 'Grade 5' },
    { id: 9908, name: 'Bilal Usman', admission_number: 'ADM-1008', roll_number: 'G6-11', father_name: 'Muhammad Usman', dob: '2012-09-30', gender: 'Male', blood_group: 'O+', address: 'Askari 10, Lahore', mobile_number: '0345-8899001', class_name: 'Grade 6' },
    { id: 9909, name: 'Anaya Usman', admission_number: 'ADM-1009', roll_number: 'G7-04', father_name: 'Usman Ghani', dob: '2011-04-14', gender: 'Female', blood_group: 'AB-', address: 'Wapda Town, Lahore', mobile_number: '0323-3344556', class_name: 'Grade 7' },
    { id: 9910, name: 'Abdullah Haroon', admission_number: 'ADM-1010', roll_number: 'G8-20', father_name: 'Haroon Rasheed', dob: '2010-01-22', gender: 'Male', blood_group: 'A+', address: 'Valencia Town, Lahore', mobile_number: '0306-6677889', class_name: 'Grade 8' }
  ];

  // Distribute DB students who lack class_name
  const mergedStudents = useMemo(() => {
    const rawList = initialStudents.length > 0 ? initialStudents : dummyStudents;
    return rawList.map((s, index) => {
      // Normalise class name format (e.g. Class 5 -> Grade 5)
      let cName = s.class_name || "";
      if (cName.startsWith("Class ")) {
        cName = cName.replace("Class ", "Grade ");
      }
      if (!cName) {
        cName = classesList[index % classesList.length].name;
      }
      return {
        ...s,
        class_name: cName,
        gender: s.gender || (index % 2 === 0 ? 'Male' : 'Female'),
        dob: s.dob || '2016-01-01',
        blood_group: s.blood_group || 'O+',
        mobile_number: s.mobile_number || '0300-1234567',
        address: s.address || 'Main Road, Lahore'
      };
    });
  }, [initialStudents, classesList]);

  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [searchQuery, setSearchQuery] = useState("");

  // Get active class details
  const activeClassDetails = useMemo(() => {
    // Determine Class Teacher
    let teacher = "Miss Sadia Tariq";
    if (selectedClass.includes("Playgroup") || selectedClass.includes("Nursery") || selectedClass.includes("Prep")) {
      teacher = "Miss Hina Fatima";
    } else if (selectedClass.includes("Grade 1") || selectedClass.includes("Grade 2")) {
      teacher = "Miss Sadia Tariq";
    } else if (selectedClass.includes("Grade 3") || selectedClass.includes("Grade 4") || selectedClass.includes("Grade 5")) {
      teacher = "Mrs. Ayesha Saddiqa";
    } else if (selectedClass.includes("Grade 6") || selectedClass.includes("Grade 7") || selectedClass.includes("Grade 8")) {
      teacher = "Sir Ali Raza";
    } else {
      teacher = "Sir Tariq Mahmood";
    }

    // Determine subjects list
    let subjects = ["Mathematics", "English", "Urdu", "Islamiat", "General Knowledge"];
    if (parseInt(selectedClass.replace("Grade ", "")) >= 6) {
      subjects = ["Mathematics", "English Literature", "Urdu Language", "Islamiat", "Physics", "Chemistry", "Computer Science"];
    }

    // Filter students
    const classStudents = mergedStudents.filter(s => s.class_name === selectedClass);
    const boys = classStudents.filter(s => s.gender === 'Male').length;
    const girls = classStudents.filter(s => s.gender === 'Female').length;

    return {
      teacher,
      subjects,
      total: classStudents.length,
      boys,
      girls
    };
  }, [selectedClass, mergedStudents]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return mergedStudents
      .filter(s => s.class_name === selectedClass)
      .filter(s => {
        const query = searchQuery.trim().toLowerCase();
        return query === "" ||
          s.name.toLowerCase().includes(query) ||
          (s.admission_number && s.admission_number.toLowerCase().includes(query)) ||
          (s.father_name && s.father_name.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const admA = a.admission_number || "";
        const admB = b.admission_number || "";
        return admA.localeCompare(admB, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [selectedClass, mergedStudents, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-indigo-50/50 via-sky-50/30 to-rose-50/30 animate-in fade-in duration-300">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-class-sheet, .printable-class-sheet * { visibility: visible !important; }
          .printable-class-sheet { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; color: black !important; }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      <TopNav />

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-4">
        
        {/* TOP BAR BRAND */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-indigo-200/60 shadow-sm no-print-btn">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-800">
                {isUrdu ? 'کلاس ڈائریکٹری اور طلبا کی تفصیلات' : 'Classes Directory & Student Details'}
              </h1>
              <p className="text-slate-500 text-xs font-semibold hidden sm:block">
                {isUrdu ? 'کلاس وائز ریکارڈ ایکسپلورر اور پرنٹ لسٹ' : 'Class-wise database record explorer & print registries'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} size="sm" variant="outline" className="rounded-xl border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm">
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isUrdu ? 'پرنٹ لسٹ' : 'Print Class List'}</span>
            </Button>
          </div>
        </div>

        {/* SELECT CLASS DROPDOWN PANEL */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 sm:p-5 shadow-sm space-y-4 no-print-btn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 w-full sm:w-72">
              <label className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider block">{isUrdu ? 'کلاس منتخب کریں' : 'Select Class / Grade'}</label>
              <select 
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full h-10 rounded-xl border border-indigo-100 bg-slate-50/50 px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classesList.map(c => {
                  // Normalise formatting to Grade 1 instead of Class 1
                  let displayName = c.name;
                  if (displayName.startsWith("Class ")) {
                    displayName = displayName.replace("Class ", "Grade ");
                  }
                  return <option key={c.id} value={displayName}>{displayName}</option>;
                })}
              </select>
            </div>

            <div className="relative w-full sm:w-72 mt-auto">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input 
                placeholder={isUrdu ? 'طالب علم کا نام یا رول نمبر سرچ کریں...' : 'Search student...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-indigo-100 h-10 text-xs"
              />
            </div>
          </div>
        </div>

        {/* CLASS DETAILS REGISTRY SHEET */}
        <div className="printable-class-sheet space-y-4">
          
          {/* 1. CLASS SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <Card className="border-indigo-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{isUrdu ? 'کل طلباء' : 'Total Enrolled'}</span>
                  <span className="text-xl font-black text-slate-800">{activeClassDetails.total} {isUrdu ? 'طلباء' : 'Students'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{isUrdu ? 'لڑکے (Boys)' : 'Boys'}</span>
                  <span className="text-xl font-black text-slate-800">{activeClassDetails.boys}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{isUrdu ? 'لڑکیاں (Girls)' : 'Girls'}</span>
                  <span className="text-xl font-black text-slate-800">{activeClassDetails.girls}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{isUrdu ? 'کلاس انچارج' : 'Class Teacher'}</span>
                  <span className="text-xs font-black text-slate-800 truncate block">{activeClassDetails.teacher}</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 2. CLASS MAIN DETAILS BLOCK & STUDENT TABLE */}
          <Card className="border-indigo-100 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  {selectedClass} {isUrdu ? 'تفصیلی ریکارڈ فائل' : 'Registry List'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                  {isUrdu ? 'سابقہ مضامین اور کلاس کی کل رجسٹریشن لسٹ' : `Taught subjects: ${activeClassDetails.subjects.join(', ')}`}
                </CardDescription>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200">
                {filteredStudents.length} {isUrdu ? 'طلبا ریکارڈ' : 'Matched Students'}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="w-[100px] pl-6 font-bold text-slate-900 text-xs">{isUrdu ? 'ایڈمیشن نمبر' : 'Adm No'}</TableHead>
                      <TableHead className="w-[100px] font-bold text-slate-900 text-xs">{isUrdu ? 'رول نمبر' : 'Roll No'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'والد کا نام' : 'Father Name'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'جنس' : 'Gender'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'بلڈ گروپ' : 'Blood Group'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'تاریخ پیدائش' : 'Date of Birth'}</TableHead>
                      <TableHead className="font-bold text-slate-900 text-xs">{isUrdu ? 'رابطہ نمبر' : 'Phone Number'}</TableHead>
                      <TableHead className="pr-6 font-bold text-slate-900 text-xs">{isUrdu ? 'رہائشی پتہ' : 'Home Address'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-slate-400 font-bold">
                          {isUrdu ? 'اس کلاس میں کوئی طالب علم نہیں ملا۔' : 'No students found matching filters.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((s) => (
                        <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                          <TableCell className="pl-6 font-mono font-bold text-xs text-indigo-600">
                            {s.admission_number || `ADM-${s.id}`}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-700">
                            {s.roll_number || 'NUR-01'}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 truncate max-w-[150px]">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-slate-700 font-medium truncate max-w-[150px]">
                            {s.father_name || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {s.gender === 'Male' ? (isUrdu ? 'لڑکا' : 'Male') : (isUrdu ? 'لڑکی' : 'Female')}
                          </TableCell>
                          <TableCell className="text-slate-600 font-mono">
                            {s.blood_group || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600 font-mono">
                            {s.dob || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600 font-mono">
                            {s.mobile_number || '-'}
                          </TableCell>
                          <TableCell className="pr-6 text-slate-500 font-medium truncate max-w-[200px]" title={s.address}>
                            {s.address || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>

      </main>
    </div>
  );
}
