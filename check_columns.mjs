import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://wxhbjpvwevxujzjsncfd.supabase.co', 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb'); 

async function checkCols() {
  const tables = ['students', 'teachers', 'parents', 'staff', 'fees'];
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*').limit(1);
    if (data && data.length > 0) {
      console.log(`=== TABLE: ${table} ===`);
      console.log(Object.keys(data[0]));
    }
  }
}
checkCols();
