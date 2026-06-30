"use client";

import { useEffect, useState } from "react";
import { 
  Users, BookOpen, DollarSign, Activity, TrendingUp, Sparkles, 
  GraduationCap, UserPlus, ShieldCheck, ArrowUpRight, 
  CheckCircle2, Layers, Calendar, CreditCard, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";

export function DashboardClient({ 
  initialStudents, 
  initialTeachers, 
  initialParents, 
  initialStaff, 
  initialRevenue 
}: {
  initialStudents: number;
  initialTeachers: number;
  initialParents: number;
  initialStaff: number;
  initialRevenue: number;
}) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';

  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [parents, setParents] = useState(initialParents);
  const [staff, setStaff] = useState(initialStaff);
  const [revenue, setRevenue] = useState(initialRevenue);

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:dashboard_main_light')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
         setStudents(s => s + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
         setTeachers(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parents' }, () => {
         setParents(p => p + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
         setStaff(st => st + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, () => {
         setRevenue(r => r + 1500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 bg-gradient-to-br from-pink-50/70 via-sky-50/40 to-rose-50/60 p-4 sm:p-6 rounded-3xl min-h-screen">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-pink-200/60 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border">
        <div className="flex items-center gap-4">
          <img src="/school_logo.png" alt="Logo" className="w-14 h-14 object-contain drop-shadow-sm shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {isUrdu ? 'برائٹ سکول' : 'Bright School'} <span className="text-pink-500 font-bold">{isUrdu ? 'اینڈ مونٹیسوری سسٹم' : '& Montessori System'}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              {isUrdu ? 'رئیل ٹائم آپریشنل پینل اور جائزہ' : 'Real-time Live Overview & Operations Panel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/80 text-pink-700 text-xs font-bold border border-pink-200 self-start md:self-auto shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
          </span>
          {isUrdu ? 'رئیل ٹائم سنک آن' : 'Live Real-time Sync Active'}
        </div>
      </div>

      {/* 🏆 TOP ROW: 4 MAIN SOFT LIGHT PASTEL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* LIGHT CARD 1: TOTAL REVENUE (SOFT PINK / SKY BLUE) */}
        <div className="relative overflow-hidden rounded-3xl p-7 bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md hover:shadow-lg transition-all group flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
              <DollarSign className="w-7 h-7" />
            </div>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold border border-sky-200">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </span>
          </div>
          <div className="my-3">
            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">
              {isUrdu ? 'کل آمدنی (Total Revenue)' : 'Total Revenue'}
            </p>
            <div className="text-3xl font-black text-slate-800 mt-1 truncate">
              Rs. {revenue.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{isUrdu ? 'ماہانہ فیس وصولی' : 'Monthly Collections'}</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
        </div>

        {/* LIGHT CARD 2: TOTAL STUDENTS (SOFT SKY BLUE) */}
        <Link href="/students" className="relative overflow-hidden rounded-3xl p-7 bg-white/90 backdrop-blur-xl border border-sky-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group block cursor-pointer flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="my-3">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              {isUrdu ? 'کل طلباء (Total Students)' : 'Total Students'}
            </p>
            <div className="text-4xl font-black text-slate-800 mt-1">{students}</div>
          </div>
          <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{isUrdu ? 'موجودہ درج شدہ طلباء' : 'Enrolled Students'}</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
        </Link>

        {/* LIGHT CARD 3: TOTAL TEACHERS (SOFT ROSE PINK) */}
        <Link href="/teachers" className="relative overflow-hidden rounded-3xl p-7 bg-white/90 backdrop-blur-xl border border-rose-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group block cursor-pointer flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-100 text-rose-500 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="my-3">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
              {isUrdu ? 'کل اساتذہ (Total Teachers)' : 'Total Teachers'}
            </p>
            <div className="text-4xl font-black text-slate-800 mt-1">{teachers}</div>
          </div>
          <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{isUrdu ? 'فعال تعلیمی عملہ' : 'Active Faculty'}</span>
            <BookOpen className="w-4 h-4 text-rose-400" />
          </div>
        </Link>

        {/* LIGHT CARD 4: TOTAL PARENTS (SOFT PURPLE / PINK) */}
        <Link href="/parents" className="relative overflow-hidden rounded-3xl p-7 bg-white/90 backdrop-blur-xl border border-purple-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group block cursor-pointer flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
              <UserPlus className="w-7 h-7" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="my-3">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              {isUrdu ? 'کل والدین (Total Parents)' : 'Total Parents'}
            </p>
            <div className="text-4xl font-black text-slate-800 mt-1">{parents}</div>
          </div>
          <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{isUrdu ? 'رجسٹرڈ پورٹل والدین' : 'Registered Parents'}</span>
            <UserPlus className="w-4 h-4 text-purple-400" />
          </div>
        </Link>

      </div>

      {/* 🔹 BOTTOM SECTION: LIGHT PASTEL SEPARATE BOXES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* SMALLER BOX 1: SUPPORT STAFF */}
        <Link href="/staff" className="relative overflow-hidden rounded-3xl p-6 bg-white/90 backdrop-blur-md border border-pink-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-pink-100 text-pink-600 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                {isUrdu ? 'دیگر عملہ (Support Staff)' : 'Support Staff'}
              </p>
              <h4 className="text-2xl font-black text-slate-800">{staff} {isUrdu ? 'ارکان' : 'Members'}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{isUrdu ? 'غیر تعلیمی و سیکیورٹی عملہ' : 'Non-teaching & Security'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* SMALLER BOX 2: REAL-TIME LIGHT BANNER */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-pink-100 via-sky-100 to-rose-100 border border-pink-200 text-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white shadow-sm rounded-2xl border border-pink-200 shrink-0">
              <Activity className="w-6 h-6 text-pink-500 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-700 text-xs font-bold mb-1 shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {isUrdu ? 'ڈیٹا بیس لائیو سنک آن' : 'Database Live Syncing'}
              </div>
              <h4 className="text-lg font-black text-slate-900">{isUrdu ? 'سسٹم سٹیٹس اور نیٹ ورک' : 'System Status & Network'}</h4>
            </div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="text-xl font-black text-pink-600 bg-white px-4 py-2 rounded-2xl shadow-sm border border-pink-200 block">{isUrdu ? '100% فعال' : '100% Active'}</span>
          </div>
        </div>

      </div>

      {/* 🚀 QUICK ACCESS MODULE NAVIGATION */}
      <div className="mt-2 space-y-4">
        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-pink-500" />
          {isUrdu ? 'فوری ماڈیولز (Quick Modules)' : 'Quick Modules'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: isUrdu ? "تعلیمی امور" : "Academics", icon: Layers, href: "/academics" },
            { title: isUrdu ? "طلباء" : "Students", icon: GraduationCap, href: "/students" },
            { title: isUrdu ? "اساتذہ" : "Teachers", icon: BookOpen, href: "/teachers" },
            { title: isUrdu ? "والدین" : "Parents", icon: UserPlus, href: "/parents" },
            { title: isUrdu ? "مالیات" : "Finance", icon: CreditCard, href: "/finance" },
            { title: isUrdu ? "حاضری" : "Attendance", icon: Calendar, href: "/attendance" },
          ].map((item, index) => (
            <Link 
              key={index} 
              href={item.href} 
              className="group relative overflow-hidden rounded-2xl p-4 bg-white backdrop-blur-md border border-pink-200/70 shadow-sm hover:shadow-md hover:border-pink-300 hover:-translate-y-1 transition-all flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center font-bold group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{item.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
