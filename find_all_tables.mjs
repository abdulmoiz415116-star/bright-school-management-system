import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://wxhbjpvwevxujzjsncfd.supabase.co', 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb'); 

async function findTables() {
  const candidates = [
    'students', 'teachers', 'parents', 'classes', 'academic_years', 'subjects', 
    'fees', 'notices', 'staff', 'attendance', 'inventory', 'inventory_items', 
    'inventory_logs', 'items', 'products', 'assets', 'stock', 'books', 
    'vehicles', 'hostel_rooms', 'hostels', 'routes', 'settings', 'system_settings'
  ];
  const found = [];
  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      found.push(table);
      console.log(`FOUND TABLE: ${table} (rows: ${data ? data.length : 0})`);
    }
  }
  console.log("ALL FOUND TABLES:", found);
}
findTables();
