import { createClient } from "@/utils/supabase/server";
import { ReportsClient } from "./ReportsClient";

export const revalidate = 0;

export default async function ReportsPage() {
  const supabase = await createClient();

  // 1. Fetch Academics stats
  const { data: students } = await supabase.from('students').select('id, name, gender, class_id');
  const { data: teachers } = await supabase.from('teachers').select('id, name, salary');
  const { data: staff } = await supabase.from('staff').select('id, name, salary');
  const { data: parents } = await supabase.from('parents').select('id');
  const { data: classes } = await supabase.from('classes').select('id, name');

  // 2. Fetch Finance stats
  const { data: fees } = await supabase.from('fees').select('id, amount, created_at');
  const { data: journal } = await supabase.from('journal_entries').select('id, amount, type, entry_date');

  // 3. Fetch Inventory stats
  const { data: inventoryItems } = await supabase.from('inventory_items').select('id, name, quantity, unit_price');
  const { data: inventoryLogs } = await supabase.from('inventory_logs').select('*');

  return (
    <ReportsClient
      students={students || []}
      teachers={teachers || []}
      staff={staff || []}
      parents={parents || []}
      classes={classes || []}
      fees={fees || []}
      journal={journal || []}
      inventoryItems={inventoryItems || []}
      inventoryLogs={inventoryLogs || []}
    />
  );
}
