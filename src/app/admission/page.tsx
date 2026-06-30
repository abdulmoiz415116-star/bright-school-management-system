import { createClient } from '@/utils/supabase/server';
import { AdmissionClient } from './AdmissionClient';
import { TopNav } from '@/components/TopNav';

export const revalidate = 0;

export default async function AdmissionPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/60 to-pink-100/40 dark:from-pink-950/40 dark:via-rose-950/20 dark:to-background animate-in fade-in duration-700">
      <TopNav />
      <div className="flex flex-col gap-8 p-4 md:p-8 relative min-h-screen max-w-6xl mx-auto w-full">
        {/* Soft Pink Aurora Background Orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-pink-300/30 dark:bg-pink-600/15 filter blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-[30%] right-[-5%] w-[45%] h-[45%] rounded-full bg-rose-300/25 dark:bg-rose-500/10 filter blur-[120px] pointer-events-none -z-10" />
        
        <AdmissionClient initialStudents={students || []} />
      </div>
    </div>
  );
}
