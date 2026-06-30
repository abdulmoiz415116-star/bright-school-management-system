import { createClient } from "@/utils/supabase/server";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const supabase = await createClient();
  
  // Fetch books
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  const dummyBooks = [
    { id: '9901', title: 'Introduction to Physics', author: 'John Doe', isbn: '978-3-16-148410-0', publisher: 'Science Press', total_copies: 10, available_copies: 8, category: 'Science', created_at: new Date().toISOString() },
    { id: '9902', title: 'Advanced Mathematics', author: 'Jane Smith', isbn: '978-1-23-456789-0', publisher: 'Math Publisher', total_copies: 5, available_copies: 5, category: 'Math', created_at: new Date().toISOString() },
    { id: '9903', title: 'History of the World', author: 'Ali Raza', isbn: '978-0-12-345678-9', publisher: 'History Books', total_copies: 15, available_copies: 12, category: 'History', created_at: new Date().toISOString() },
    { id: '9904', title: 'Learn English Grammar', author: 'Sarah Connor', isbn: '978-9-87-654321-0', publisher: 'Language Arts', total_copies: 20, available_copies: 19, category: 'English', created_at: new Date().toISOString() },
    { id: '9905', title: 'Computer Science 101', author: 'Tariq Jameel', isbn: '978-1-11-222333-4', publisher: 'Tech Books', total_copies: 8, available_copies: 2, category: 'Computer', created_at: new Date().toISOString() }
  ];

  return (
    <LibraryClient 
      initialBooks={[...dummyBooks, ...(books || [])] as any} 
    />
  );
}
