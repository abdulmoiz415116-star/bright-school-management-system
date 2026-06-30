import { createClient } from "@/utils/supabase/server";
import { ParentsClient } from "./ParentsClient";

export default async function ParentsPage() {
  const supabase = await createClient();
  
  const { data: parents } = await supabase
    .from('parents')
    .select('*')
    .order('created_at', { ascending: false });

  return <ParentsClient initialParents={(parents || []) as any} />;
}

