"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function StudentManager({ initialStudents }: { initialStudents: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [newName, setNewName] = useState("");
  const supabase = createClient();

  const handleAddStudent = async () => {
    if (!newName.trim()) return;
    
    // Insecure direct client-side insert
    const { data, error } = await supabase
      .from('students')
      .insert([{ name: newName.trim(), grade: '10th', roll_number: `R${Math.floor(Math.random() * 1000)}` }])
      .select();

    if (!error && data) {
      setStudents([...students, data[0]]);
      setNewName("");
    }
  };

  return (
    <div className="mt-8 bg-card text-card-foreground shadow border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Quick Add Student</h3>
      <div className="flex gap-2 mb-6">
        <input 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          placeholder="Student Name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button 
          onClick={handleAddStudent}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Add
        </button>
      </div>

      <h3 className="text-lg font-bold mb-4">Recent Students</h3>
      <div className="space-y-4">
        {students.slice(0, 5).map(s => (
          <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
            <span className="font-medium">{s.name}</span>
            <span className="text-muted-foreground text-sm">{s.roll_number} - {s.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
