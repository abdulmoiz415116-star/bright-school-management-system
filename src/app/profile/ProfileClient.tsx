"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, MapPin, Building, ShieldCheck, Camera, Save } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProfileClient() {
  const t = useTranslations("Profile");
  const c = useTranslations("Common");
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@school.com",
    phone: "+92 300 1234567",
    address: "Lahore, Pakistan"
  });

  useEffect(() => {
    const saved = localStorage.getItem("admin_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save to local storage for persistence
    localStorage.setItem("admin_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("profile_updated"));
    
    setTimeout(() => {
      setLoading(false);
      alert(t("profileUpdated"));
    }, 600);
  };

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">{fullName}</span>
            <span className="text-xs text-muted-foreground">{t("superAdmin")}</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column - Profile Card */}
          <Card className="border-border shadow-sm h-fit">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6 group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src="/admin_avatar.png" />
                  <AvatarFallback className="text-4xl">AD</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white h-8 w-8" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
              <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">{t("superAdmin")}</Badge>
              <div className="w-full mt-8 space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-3" />
                  {profile.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-3" />
                  {profile.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-3" />
                  {t("mainCampus")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Edit Form */}
          <Card className="md:col-span-2 border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>{t("personalInformation")}</CardTitle>
              <CardDescription>{t("updateDetails")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input id="firstName" value={profile.firstName} onChange={handleInputChange} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input id="lastName" value={profile.lastName} onChange={handleInputChange} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("emailAddress")}</Label>
                    <Input id="email" type="email" value={profile.email} onChange={handleInputChange} className="bg-background" />
                    <p className="text-xs text-muted-foreground">{t("updateEmail")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phoneNumber")}</Label>
                    <Input id="phone" type="tel" value={profile.phone} onChange={handleInputChange} className="bg-background" dir="ltr" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">{t("address")}</Label>
                    <Input id="address" value={profile.address} onChange={handleInputChange} className="bg-background" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? t("saving") : <><Save className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t("saveChanges")}</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
