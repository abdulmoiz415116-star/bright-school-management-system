import { createClient } from "@/utils/supabase/server";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Note: For a real app, you would fetch the logged-in user's profile from auth.users and profiles table.
  // For this ultra-pro demo, we mock the super admin profile.

  return <ProfileClient />;
}
