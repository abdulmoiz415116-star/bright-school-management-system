import { createClient } from "@/utils/supabase/server";
import { HostelClient } from "./HostelClient";

export default async function HostelPage() {
  const supabase = await createClient();
  
  // Fetch hostels
  const { data: hostels } = await supabase
    .from('hostels')
    .select('*')
    .order('name', { ascending: true });

  return (
    <HostelClient 
      initialHostels={hostels || []} 
    />
  );
}
