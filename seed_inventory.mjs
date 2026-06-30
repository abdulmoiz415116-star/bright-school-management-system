import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://wxhbjpvwevxujzjsncfd.supabase.co', 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb'); 

const sampleItems = [
  { name: 'Whiteboard Markers (Blue & Black)', category: 'Stationery', quantity: 150, unit: 'pcs', location: 'Main Store - Rack A1', minimum_stock_level: 20 },
  { name: 'A4 Printing Paper (80gsm)', category: 'Stationery', quantity: 45, unit: 'boxes', location: 'Main Store - Rack A2', minimum_stock_level: 10 },
  { name: 'Student Wooden Desks & Chairs', category: 'Furniture', quantity: 80, unit: 'sets', location: 'Furniture Block', minimum_stock_level: 15 },
  { name: 'Multimedia Projector 4K', category: 'Electronics', quantity: 6, unit: 'pcs', location: 'AV Room', minimum_stock_level: 2 },
  { name: 'Physics Lab Microscope', category: 'Lab Equipment', quantity: 12, unit: 'pcs', location: 'Science Lab 1', minimum_stock_level: 3 },
  { name: 'Chemistry Beaker Set (500ml)', category: 'Lab Equipment', quantity: 30, unit: 'sets', location: 'Chemistry Lab', minimum_stock_level: 5 },
  { name: 'Official Footballs (Size 5)', category: 'Sports', quantity: 25, unit: 'pcs', location: 'Sports Room', minimum_stock_level: 5 },
  { name: 'Badminton Rackets & Shuttles', category: 'Sports', quantity: 18, unit: 'sets', location: 'Sports Room', minimum_stock_level: 4 },
  { name: 'Teacher Executive Desks', category: 'Furniture', quantity: 20, unit: 'pcs', location: 'Staff Room', minimum_stock_level: 3 },
  { name: 'Computer Lab Core i7 PCs', category: 'Electronics', quantity: 35, unit: 'pcs', location: 'Computer Lab 2', minimum_stock_level: 5 }
];

async function seed() {
  console.log("Checking current inventory_items...");
  const { data: existing, error: fetchErr } = await supabase.from('inventory_items').select('*');
  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
  } else {
    console.log("Existing items count:", existing ? existing.length : 0);
    if (existing && existing.length > 0) {
      console.log("Sample existing item keys:", Object.keys(existing[0]));
    }
  }

  console.log("Inserting 10 seed items...");
  const { data, error } = await supabase.from('inventory_items').insert(sampleItems).select();
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Successfully inserted items:", data.length);
  }
}

seed();
