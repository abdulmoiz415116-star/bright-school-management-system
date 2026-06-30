import { createClient } from '@supabase/supabase-js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extract keys from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || 'https://wxhbjpvwevxujzjsncfd.supabase.co';
const SUPABASE_ANON_KEY = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

async function seed() {
  console.log("Seeding Academics Data...");
  
  // Add 5 Classes
  const classes = [
    { name: 'Grade 6', numeric_value: 6 },
    { name: 'Grade 7', numeric_value: 7 },
    { name: 'Grade 8', numeric_value: 8 },
    { name: 'Grade 9', numeric_value: 9 },
    { name: 'Grade 10', numeric_value: 10 }
  ];
  
  const { error: cError } = await supabase.from('classes').insert(classes);
  if (cError) console.error("Error inserting classes:", cError);
  else console.log("Added 5 classes.");

  // Add 5 Subjects
  const subjects = [
    { code: 'PHY101', name: 'Physics', type: 'theory' },
    { code: 'CHM101', name: 'Chemistry', type: 'theory' },
    { code: 'BIO101', name: 'Biology', type: 'theory' },
    { code: 'CSC101', name: 'Computer Science', type: 'theory' },
    { code: 'HIS101', name: 'History', type: 'theory' }
  ];

  const { error: sError } = await supabase.from('subjects').insert(subjects);
  if (sError) console.error("Error inserting subjects:", sError);
  else console.log("Added 5 subjects.");
  
  // Add 5 Academic Years
  const years = [
    { title: '2026-2027', start_date: '2026-09-01', end_date: '2027-06-30', is_active: true },
    { title: '2027-2028', start_date: '2027-09-01', end_date: '2028-06-30', is_active: false },
    { title: '2028-2029', start_date: '2028-09-01', end_date: '2029-06-30', is_active: false },
    { title: '2029-2030', start_date: '2029-09-01', end_date: '2030-06-30', is_active: false },
    { title: '2030-2031', start_date: '2030-09-01', end_date: '2031-06-30', is_active: false }
  ];

  const { error: yError } = await supabase.from('academic_years').insert(years);
  if (yError) console.error("Error inserting academic years:", yError);
  else console.log("Added 5 academic years.");

  console.log("Seeding complete!");
}

seed();
