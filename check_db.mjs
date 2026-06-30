import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://wxhbjpvwevxujzjsncfd.supabase.co', 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb'); 

async function check() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  console.log(JSON.stringify({data, error}, null, 2));

  const classes = await supabase.from('classes').select('*');
  console.log('Classes:', JSON.stringify(classes, null, 2));
}

check();
