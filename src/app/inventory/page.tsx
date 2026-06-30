import { createClient } from '@/utils/supabase/server';
import { InventoryClient } from './InventoryClient';

export const revalidate = 0;

export default async function InventoryPage() {
  const supabase = await createClient();

  // Fetch initial inventory data
  const { data: inventoryItems } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  const { data: inventoryLogs } = await supabase
    .from('inventory_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(50);

  return <InventoryClient 
    initialItems={inventoryItems || []} 
    initialLogs={inventoryLogs || []} 
  />;
}
