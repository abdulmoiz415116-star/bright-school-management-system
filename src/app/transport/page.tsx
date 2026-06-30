import { createClient } from "@/utils/supabase/server";
import { TransportClient } from "./TransportClient";

export default async function TransportPage() {
  const supabase = await createClient();
  
  // Fetch routes
  const { data: routes } = await supabase
    .from('transport_routes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <TransportClient 
      initialRoutes={routes || []} 
    />
  );
}
