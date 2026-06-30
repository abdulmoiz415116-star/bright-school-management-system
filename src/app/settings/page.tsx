"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, Bell, Lock, User, ShieldCheck, Save, CheckCircle2, Key, Smartphone, Mail, Globe } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/TopNav";

export default function SettingsPage() {
  const profile = useAdminProfile();
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const router = useRouter();

  // Interactive Form States
  const [profileForm, setProfileForm] = useState({
    firstName: profile.firstName || "Super",
    lastName: profile.lastName || "Admin",
    email: "admin@brightschool.edu.pk",
    phone: "0300-1234567"
  });

  const [notifState, setNotifState] = useState({
    smsFeeAlerts: true,
    emailAttendance: true,
    emergencyBroadcasts: true
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    twoFactorEnabled: false
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("admin_profile_firstName", profileForm.firstName);
    localStorage.setItem("admin_profile_lastName", profileForm.lastName);
    alert(isUrdu ? "ایڈمن پروفائل محفوظ ہو گئی!" : "Admin Profile Updated Successfully!");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isUrdu ? "سیکیورٹی پاس ورڈ تبدیل کر دیا گیا!" : "Security Settings Updated!");
    setSecurityForm({ ...securityForm, currentPassword: "", newPassword: "" });
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-blue-50/50 via-sky-50/30 to-indigo-50/30 animate-in fade-in duration-300">
      
      <TopNav />

      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl border border-blue-200 shrink-0">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {isUrdu ? 'سسٹم سیٹنگز اور کنفیگریشن' : 'System Settings & Control'}
                </h1>
                <Badge className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-0.5 border border-blue-200">
                  REALTIME CONTROL
                </Badge>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                {isUrdu ? 'اپنے سکول مینجمنٹ سسٹم کی سیکیورٹی، رولز اور نوٹیفکیشنز کنفیگر کریں' : 'Configure application preferences, security controls, and role-based permissions'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 INTERACTIVE SETTINGS CARDS GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* 1. PROFILE SETTINGS */}
          <Card className="border border-blue-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600"/>
                {isUrdu ? 'پروفائل سیٹنگز (Profile Settings)' : 'Admin Profile Settings'}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                {isUrdu ? 'اپنے ایڈمن اکاؤنٹ کی تفصیلات تبدیل کریں' : 'Update your admin profile credentials and contact details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'پہلا نام' : 'First Name'}</Label>
                    <Input value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} className="rounded-xl mt-1 h-9 text-xs border-blue-200 font-bold" />
                  </div>
                  <div>
                    <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'آخری نام' : 'Last Name'}</Label>
                    <Input value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} className="rounded-xl mt-1 h-9 text-xs border-blue-200 font-bold" />
                  </div>
                </div>
                <div>
                  <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'ای میل ایڈریس' : 'Official Email'}</Label>
                  <Input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="rounded-xl mt-1 h-9 text-xs border-blue-200 font-mono" />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-9 flex items-center gap-1.5 shadow-sm">
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'پروفائل محفوظ کریں' : 'Save Changes'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 2. NOTIFICATIONS & ALERTS */}
          <Card className="border border-blue-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600"/>
                {isUrdu ? 'نوٹیفکیشنز اور الرٹس (Notifications)' : 'Notification Preferences'}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                {isUrdu ? 'والدین اور اساتذہ کو ایس ایم ایس اور ای میل الرٹس کنفیگر کریں' : 'Manage automated SMS & Email alerts dispatched to parents'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">SMS Fee Reminders</span>
                    <span className="text-[10px] text-slate-500 font-semibold block">Auto SMS to parents for fee dues</span>
                  </div>
                </div>
                <Switch checked={notifState.smsFeeAlerts} onCheckedChange={v => setNotifState({ ...notifState, smsFeeAlerts: v })} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Attendance Email Alerts</span>
                    <span className="text-[10px] text-slate-500 font-semibold block">Daily student absence notifications</span>
                  </div>
                </div>
                <Switch checked={notifState.emailAttendance} onCheckedChange={v => setNotifState({ ...notifState, emailAttendance: v })} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Emergency Broadcasts</span>
                    <span className="text-[10px] text-slate-500 font-semibold block">Instant portal notices for school holidays</span>
                  </div>
                </div>
                <Switch checked={notifState.emergencyBroadcasts} onCheckedChange={v => setNotifState({ ...notifState, emergencyBroadcasts: v })} />
              </div>
            </CardContent>
          </Card>

          {/* 3. SECURITY & PRIVACY */}
          <Card className="border border-blue-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600"/>
                {isUrdu ? 'سیکیورٹی اور پاس ورڈ (Security & Privacy)' : 'Security Controls & Passwords'}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                {isUrdu ? 'اپنا پاس ورڈ اور ٹو فیکٹر سیکیورٹی اپ ڈیٹ کریں' : 'Update authentication passwords and 2FA encryption'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div>
                  <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'موجودہ پاس ورڈ' : 'Current Password'}</Label>
                  <Input type="password" required value={securityForm.currentPassword} onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} placeholder="••••••••" className="rounded-xl mt-1 h-9 text-xs border-blue-200" />
                </div>
                <div>
                  <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'نیا پاس ورڈ' : 'New Password'}</Label>
                  <Input type="password" required value={securityForm.newPassword} onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })} placeholder="••••••••" className="rounded-xl mt-1 h-9 text-xs border-blue-200" />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-9 flex items-center gap-1.5 shadow-sm">
                    <Key className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Update Password'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 4. ROLE MANAGEMENT */}
          <Card className="border border-blue-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600"/>
                {isUrdu ? 'رولز اور پرمیشنز (Role Management)' : 'Role Access Control Matrix'}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                {isUrdu ? 'اساتذہ، سٹوڈنٹس اور پیرنٹس کی رسائی کے رولز' : 'View module access rules configured across user roles'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-blue-950 block">👑 Super Admin</span>
                  <span className="text-[10px] font-semibold text-blue-700 block">Full Access (All Modules & Finance)</span>
                </div>
                <Badge className="bg-blue-600 text-white text-[9px] font-bold">FULL ACCESS</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-emerald-950 block">👨‍🏫 Teachers & Faculty</span>
                  <span className="text-[10px] font-semibold text-emerald-700 block">Class Timetable, Attendance & Marks Entry</span>
                </div>
                <Badge className="bg-emerald-600 text-white text-[9px] font-bold">LIMITED ACCESS</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-purple-950 block">👨‍👦 Respected Parents</span>
                  <span className="text-[10px] font-semibold text-purple-700 block">Student Progress Card & Fee Voucher Portal Only</span>
                </div>
                <Badge className="bg-purple-600 text-white text-[9px] font-bold">RESTRICTED PORTAL</Badge>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
