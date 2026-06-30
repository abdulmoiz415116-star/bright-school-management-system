import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://wxhbjpvwevxujzjsncfd.supabase.co', 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb'); 

async function testTables() {
  const tables = ['inventory', 'inventory_items', 'inventory_logs', 'items', 'products', 'assets', 'stock'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    console.log(`--- Table: ${table} ---`);
    if (error) {
      console.log(`Error: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`Count: ${data ? data.length : 0}`);
    }
  }
}
testTables();
