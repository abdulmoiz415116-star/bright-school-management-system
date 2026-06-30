"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ShieldCheck, Lock, Mail, User, Sparkles, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LoginClient() {
  const router = useRouter();
  const locale = useLocale();
  const isUrdu = locale === 'ur';

  const [role, setRole] = useState<"Super Admin" | "Parent">("Super Admin");
  const [email, setEmail] = useState("admin@brightschool.edu.pk");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleSelect = (selectedRole: "Super Admin" | "Parent") => {
    setRole(selectedRole);
    if (selectedRole === "Parent") {
      setEmail("parent@brightschool.edu.pk");
      setPassword("parent123");
    } else {
      setEmail("admin@brightschool.edu.pk");
      setPassword("admin123");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(isUrdu ? "برائے مہربانی ای میل اور پاس ورڈ درج کریں۔" : "Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      // Set Auth Cookies
      Cookies.set("auth_token", role === "Parent" ? "parent_session_9042" : "secure_admin_session_9042", { expires: 7, path: '/' });
      Cookies.set("user_role", role, { expires: 7, path: '/' });
      Cookies.set("user_email", email, { expires: 7, path: '/' });
      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${role === "Parent" ? "parent_session_9042" : "secure_admin_session_9042"}; path=/; max-age=604800`;
        document.cookie = `user_role=${role}; path=/; max-age=604800`;
      }

      const redirectUrl = role === "Parent" ? "/portal/parents" : "/";
      setSuccessMsg(isUrdu ? `${role === "Parent" ? "والدین پورٹل" : "ڈیش بورڈ"} پر منتقل کیا جا رہا ہے...` : `Login successful! Redirecting...`);
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 700);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-sky-50/50 to-rose-100/40 p-4 relative overflow-hidden">
      
      {/* Background Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-300/30 filter blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-sky-300/30 filter blur-[130px] pointer-events-none" />

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-pink-200/80 overflow-hidden z-10 animate-in zoom-in-95 duration-500">
        
        {/* Top Header Branding */}
        <CardHeader className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-8 text-white text-center space-y-3 relative">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 mx-auto flex items-center justify-center p-2 shadow-xl shrink-0">
            <img src="/school_logo.png" alt="Bright School Crest" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Bright School</h2>
            <p className="text-xs font-bold text-pink-100 uppercase tracking-wider">& Montessori System</p>
            <Badge className="mt-2 bg-white/20 text-white font-bold text-[10px] px-3 py-0.5 border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
              {role === "Parent" ? (isUrdu ? 'والدین و سٹوڈنٹ پورٹل' : 'Parent & Student Portal') : (isUrdu ? 'سپر ایڈمن کنٹرول پورٹل' : 'Super Admin Portal')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          
          {/* TWO PRIMARY ROLE BUTTONS */}
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase text-slate-700 block text-center">
              {isUrdu ? 'لاگ ان پورٹل کا انتخاب کریں' : 'Select Login Portal'}
            </Label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-pink-50 rounded-2xl border border-pink-200">
              <button
                type="button"
                onClick={() => handleRoleSelect("Super Admin")}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${role === "Super Admin" ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md scale-[1.02]' : 'text-slate-700 hover:bg-white/80'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isUrdu ? 'سپر ایڈمن' : 'Super Admin'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("Parent")}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${role === "Parent" ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md scale-[1.02]' : 'text-slate-700 hover:bg-white/80'}`}
              >
                <Users className="w-4 h-4" />
                <span>{isUrdu ? 'والدین پورٹل' : 'Parent Portal'}</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/15 border border-rose-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email / Student ID Input */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase text-slate-700">
                {role === "Parent" ? (isUrdu ? 'والدین ای میل / سٹوڈنٹ بی فارم' : 'Parent Email / Student ID') : (isUrdu ? 'ایڈمن ای میل' : 'Admin Email Address')}
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === "Parent" ? "parent@brightschool.edu.pk" : "admin@brightschool.edu.pk"}
                  className="pl-10 h-11 rounded-xl border-pink-200 font-semibold text-sm bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'پاس ورڈ' : 'Password'}</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-xl border-pink-200 font-semibold text-sm bg-slate-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Notice */}
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded text-pink-600 w-4 h-4 border-pink-300" />
                <span className="text-slate-600">{isUrdu ? 'مجھے یاد رکھیں' : 'Remember Me'}</span>
              </label>
              <span className="text-pink-600 hover:underline cursor-pointer">{isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-pink-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isUrdu ? 'سسٹم تصدیق کر رہا ہے...' : 'Authenticating...'}
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {isUrdu ? `${role === "Parent" ? "والدین پورٹل میں لاگ ان کریں" : "سپر ایڈمن سسٹم میں لاگ ان کریں"}` : `Login as ${role}`}
                </>
              )}
            </Button>

          </form>

          {/* Footer credentials reminder */}
          <div className="text-center pt-2 border-t border-pink-100">
            <p className="text-[11px] text-slate-500 font-medium">
              {role === "Parent" ? (
                <span>Parent Login: <span className="font-mono font-bold text-slate-800">parent@brightschool.edu.pk</span> / <span className="font-mono font-bold text-slate-800">parent123</span></span>
              ) : (
                <span>Super Admin Login: <span className="font-mono font-bold text-slate-800">admin@brightschool.edu.pk</span> / <span className="font-mono font-bold text-slate-800">admin123</span></span>
              )}
            </p>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
