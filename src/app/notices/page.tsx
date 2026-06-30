import { createClient } from "@/utils/supabase/server";
import { NoticesClient } from "./NoticesClient";

export default async function NoticesPage() {
  const supabase = await createClient();
  
  // Fetch notices
  const { data: notices } = await supabase
    .from('notices')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  const dummyNotices = [
    { id: '9901', title: 'Eid Holidays Announcement', content: 'The school will remain closed from Monday to Wednesday on account of Eid-ul-Fitr. Normal classes will resume on Thursday.', target_audience: 'all', is_active: true, created_at: new Date(Date.now() - 100000).toISOString(), profiles: { full_name: 'Admin' } },
    { id: '9902', title: 'PTM for Junior Classes', content: 'Parent-Teacher Meeting for Playgroup to Class 5 will be held this Saturday between 9 AM and 1 PM. All parents are requested to attend.', target_audience: 'parents', is_active: true, created_at: new Date(Date.now() - 200000).toISOString(), profiles: { full_name: 'Admin' } },
    { id: '9903', title: 'Annual Sports Day', content: 'Students interested in participating in the Annual Sports Day must register their names with the sports instructor by Friday.', target_audience: 'students', is_active: true, created_at: new Date(Date.now() - 300000).toISOString(), profiles: { full_name: 'Admin' } },
    { id: '9904', title: 'Staff Meeting Reminder', content: 'There will be a brief staff meeting tomorrow at 2:30 PM in the main hall to discuss the upcoming exam schedule.', target_audience: 'teachers', is_active: true, created_at: new Date(Date.now() - 400000).toISOString(), profiles: { full_name: 'Admin' } },
    { id: '9905', title: 'School Timings Update', content: 'Due to severe winter weather, school timings have been changed to 8:30 AM - 1:30 PM until further notice.', target_audience: 'all', is_active: true, created_at: new Date(Date.now() - 500000).toISOString(), profiles: { full_name: 'Admin' } }
  ];

  return (
    <NoticesClient 
      initialNotices={[...dummyNotices, ...(notices || [])] as any} 
    />
  );
}
