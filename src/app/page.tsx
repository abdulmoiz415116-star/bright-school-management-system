import { DashboardClient } from './DashboardClient'
import { createClient } from '@/utils/supabase/server'
import { TopNav } from '@/components/TopNav'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: students } = await supabase.from('students').select('id')
  const { data: teachers } = await supabase.from('teachers').select('id')
  const { data: parents } = await supabase.from('parents').select('id')
  const { data: staff } = await supabase.from('staff').select('id')
  const { data: fees } = await supabase.from('fees').select('amount')

  const dbStudentsCount = students?.length || 0;
  // Total dummy students across 5 classes (10 per class) = 50
  const totalStudents = 50 + dbStudentsCount;
  const totalTeachers = (teachers?.length || 0) + 10;
  const totalParents = (parents?.length || 0) + 25;
  const totalStaff = (staff?.length || 0) + 8;
  
  const totalRevenue = (fees?.reduce((acc: number, fee: any) => acc + Number(fee.amount || 0), 0) || 0) + 250000;

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/60 to-pink-100/40 dark:from-pink-950/40 dark:via-rose-950/20 dark:to-background animate-in fade-in duration-700">
      <TopNav />
      <div className="flex flex-col gap-8 p-6 md:p-10 relative min-h-screen max-w-7xl mx-auto w-full">
        {/* Soft Pink Aurora Background Orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-pink-300/30 dark:bg-pink-600/15 filter blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-[30%] right-[-5%] w-[45%] h-[45%] rounded-full bg-rose-300/25 dark:bg-rose-500/10 filter blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-5%] left-[25%] w-[40%] h-[40%] rounded-full bg-pink-200/40 dark:bg-pink-700/10 filter blur-[100px] pointer-events-none -z-10" />
        
        <DashboardClient 
          initialStudents={totalStudents} 
          initialTeachers={totalTeachers} 
          initialParents={totalParents}
          initialStaff={totalStaff}
          initialRevenue={totalRevenue} 
        />
      </div>
    </div>
  )
}

