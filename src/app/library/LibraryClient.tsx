"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Loader2, Trash2, LibraryBig, Bookmark, CheckCircle2, RotateCcw, UserCheck, Calendar, Search } from "lucide-react";
import { useLocale } from "next-intl";
import { TopNav } from "@/components/TopNav";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  total_copies: number;
  available_copies: number;
  category: string;
};

type IssuedRecord = {
  id: string;
  bookTitle: string;
  memberName: string;
  memberRole: string;
  issueDate: string;
  dueDate: string;
  status: "Issued" | "Returned";
};

export function LibraryClient({ initialBooks }: { initialBooks: Book[] }) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const [activeTab, setActiveTab] = useState<"catalog" | "issued">("catalog");

  // Rich initial dummy books
  const defaultBooks: Book[] = [
    { id: "b1", title: "General Science & Experiments", author: "Dr. A. Q. Khan", isbn: "ISBN-978001", publisher: "Oxford Press", total_copies: 10, available_copies: 8, category: "Science" },
    { id: "b2", title: "Advanced Mathematics & Logic", author: "Prof. Tariq Mahmood", isbn: "ISBN-978002", publisher: "National Book Foundation", total_copies: 15, available_copies: 12, category: "Mathematics" },
    { id: "b3", title: "English Literature & Poetry", author: "William Shakespeare", isbn: "ISBN-978003", publisher: "Cambridge Press", total_copies: 8, available_copies: 6, category: "English" },
    { id: "b4", title: "Urdu Adab & History", author: "Allama Iqbal", isbn: "ISBN-978004", publisher: "Ferozsons", total_copies: 12, available_copies: 11, category: "Urdu" },
    { id: "b5", title: "Islamic History & Ethics", author: "Mufti Taqi Usmani", isbn: "ISBN-978005", publisher: "Darul Uloom", total_copies: 20, available_copies: 18, category: "Islamiat" }
  ];

  const mergedBooks = initialBooks.length > 0 ? initialBooks : defaultBooks;
  const [books, setBooks] = useState<Book[]>(mergedBooks);

  // Initial Issued Records highlighting Abdul Mueez prominently
  const [issuedRecords, setIssuedRecords] = useState<IssuedRecord[]>([
    {
      id: "iss-1",
      bookTitle: "General Science & Experiments",
      memberName: "Abdul Mueez (عبدالمعیز)",
      memberRole: "Student (Grade 5)",
      issueDate: "2026-06-28",
      dueDate: "2026-07-05",
      status: "Issued"
    },
    {
      id: "iss-2",
      bookTitle: "Advanced Mathematics & Logic",
      memberName: "Mrs. Ayesha Saddiqa",
      memberRole: "Faculty Teacher",
      issueDate: "2026-06-20",
      dueDate: "2026-06-27",
      status: "Returned"
    }
  ]);

  // Add Book Form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [category, setCategory] = useState("");
  const [totalCopies, setTotalCopies] = useState("5");
  const [loading, setLoading] = useState(false);

  // Issue Book Modal State
  const [issuingBook, setIssuingBook] = useState<Book | null>(null);
  const [memberName, setMemberName] = useState("Abdul Mueez (عبدالمعیز)");
  const [memberRole, setMemberRole] = useState("Student (Grade 5)");
  const [issueDate, setIssueDate] = useState("2026-06-28");
  const [dueDate, setDueDate] = useState("2026-07-05");

  const supabase = createClient();

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    
    setLoading(true);
    const copies = parseInt(totalCopies, 10) || 1;
    const payload: Book = { 
      id: Date.now().toString(),
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim() || `ISBN-${Math.floor(1000 + Math.random() * 9000)}`,
      publisher: publisher.trim() || "School Press",
      category: category.trim() || "General",
      total_copies: copies,
      available_copies: copies
    };

    setBooks(prev => [payload, ...prev]);
    setTitle(""); setAuthor(""); setIsbn(""); setPublisher(""); setCategory(""); setTotalCopies("5");
    setLoading(false);
  };

  const handleOpenIssueModal = (book: Book) => {
    setIssuingBook(book);
  };

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuingBook) return;

    const newRecord: IssuedRecord = {
      id: `iss-${Date.now()}`,
      bookTitle: issuingBook.title,
      memberName: memberName.trim() || "Abdul Mueez (عبدالمعیز)",
      memberRole: memberRole || "Student",
      issueDate,
      dueDate,
      status: "Issued"
    };

    // Update available copies
    setBooks(prev => prev.map(b => b.id === issuingBook.id ? { ...b, available_copies: Math.max(0, b.available_copies - 1) } : b));
    setIssuedRecords(prev => [newRecord, ...prev]);
    alert(isUrdu ? `کتاب (${issuingBook.title}) ڈائریکٹ ${newRecord.memberName} کو جاری کر دی گئی!` : `Book issued successfully!`);
    setIssuingBook(null);
    setActiveTab("issued");
  };

  const handleReturnBook = (recId: string, bookTitle: string) => {
    setIssuedRecords(prev => prev.map(r => r.id === recId ? { ...r, status: "Returned" } : r));
    setBooks(prev => prev.map(b => b.title === bookTitle ? { ...b, available_copies: b.available_copies + 1 } : b));
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-blue-50/50 via-sky-50/30 to-indigo-50/30 animate-in fade-in duration-300">
      
      <TopNav />

      {/* ISSUE BOOK MODAL */}
      {issuingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                  {isUrdu ? 'کتاب کا اجرا درج کریں (Issue Book)' : 'Issue Book to Student/Teacher'}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-blue-700 mt-0.5">
                  کتاب: {issuingBook.title}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIssuingBook(null)} className="rounded-full h-8 w-8">✕</Button>
            </CardHeader>
            <form onSubmit={handleConfirmIssue}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'طالب علم / ٹیچر کا نام *' : 'Student / Member Name *'}</Label>
                  <Input required value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="e.g. Abdul Mueez (عبدالمعیز)" className="rounded-xl font-bold mt-1 h-10 text-xs border-blue-200" />
                </div>
                <div>
                  <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'عہدہ / کلاس' : 'Designation / Class'}</Label>
                  <Input value={memberRole} onChange={e => setMemberRole(e.target.value)} placeholder="e.g. Student (Grade 5)" className="rounded-xl font-bold mt-1 h-10 text-xs border-blue-200" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'اجرا کی تاریخ' : 'Issue Date'}</Label>
                    <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="rounded-xl font-mono mt-1 h-10 text-xs border-blue-200" />
                  </div>
                  <div>
                    <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'واپسی کی تاریخ' : 'Return Due Date'}</Label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-xl font-mono mt-1 h-10 text-xs border-blue-200" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIssuingBook(null)} className="rounded-xl font-bold h-9 text-xs">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs px-5">{isUrdu ? 'کتاب جاری کریں' : 'Confirm Issue'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl border border-blue-200 shrink-0">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {isUrdu ? 'لائبریری کیٹلاگ اور کتب کا اجرا' : 'Library Catalog & Circulation Portal'}
                </h1>
                <Badge className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-0.5 border border-blue-200">
                  REALTIME CIRCULATION
                </Badge>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                {isUrdu ? 'کتابوں کی لسٹ، عبدالمعیز اور دیگر طلباء کو ڈائریکٹ کتب کے اجرا کا مکمل ریکارڈ' : 'Manage library books catalog, issue books to students/teachers, and track due dates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`py-2 px-4 rounded-xl font-bold text-xs transition-all ${activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              📖 {isUrdu ? 'کتابوں کا کیٹلاگ' : 'Books Catalog'}
            </button>
            <button
              onClick={() => setActiveTab("issued")}
              className={`py-2 px-4 rounded-xl font-bold text-xs transition-all ${activeTab === 'issued' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              📤 {isUrdu ? 'اجرا شدہ کتب کا ہسٹری لیجر' : 'Issued Books Ledger'} ({issuedRecords.filter(r => r.status === 'Issued').length})
            </button>
          </div>
        </div>

        {/* TAB 1: BOOKS CATALOG */}
        {activeTab === "catalog" && (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* ADD BOOK FORM */}
            <Card className="lg:col-span-1 border-blue-200 shadow-md bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5">
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600"/>
                  {isUrdu ? 'نئی کتاب شامل کریں' : 'Add New Book'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-500">
                  {isUrdu ? 'لائبریری میں نئی کتاب اور کاپیاں درج کریں' : 'Register a new book title in the central library database'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddBook} className="space-y-4">
                  <div>
                    <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'کتاب کا نام (Book Title) *' : 'Book Title *'}</Label>
                    <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. General Science" className="rounded-xl mt-1 h-9 text-xs border-blue-200 font-bold" />
                  </div>
                  <div>
                    <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'مصنف کا نام (Author) *' : 'Author Name *'}</Label>
                    <Input required value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Dr. A. Q. Khan" className="rounded-xl mt-1 h-9 text-xs border-blue-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'کیٹیگری (Category)' : 'Category'}</Label>
                      <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Science" className="rounded-xl mt-1 h-9 text-xs border-blue-200" />
                    </div>
                    <div>
                      <Label className="font-bold text-xs text-slate-700">{isUrdu ? 'کُل کاپیاں (Total Copies)' : 'Total Copies'}</Label>
                      <Input type="number" value={totalCopies} onChange={e => setTotalCopies(e.target.value)} className="rounded-xl mt-1 h-9 text-xs border-blue-200 font-mono font-bold" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-9 w-full shadow-sm">
                      <Plus className="w-4 h-4 mr-1" /> {isUrdu ? 'کتاب رجسٹر کریں' : 'Register Book'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* BOOKS CATALOG TABLE */}
            <Card className="lg:col-span-2 border-blue-200 shadow-md bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-800">Available Library Books</CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-500">Click 'Issue Book' to assign any book to a student or teacher.</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 border border-blue-200">
                  Total Titles: {books.length}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="pl-4">Book Title</TableHead>
                        <TableHead>Author / Category</TableHead>
                        <TableHead className="text-center">Copies Status</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs font-semibold">
                      {books.map((b) => (
                        <TableRow key={b.id} className="hover:bg-blue-50/30 border-b border-slate-100">
                          <TableCell className="pl-4 py-3">
                            <span className="font-black text-slate-900 block">{b.title}</span>
                            <span className="font-mono text-[10px] text-slate-400">{b.isbn}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="font-bold text-slate-700 block">{b.author}</span>
                            <Badge variant="outline" className="text-[10px] py-0 mt-0.5 bg-white">{b.category || 'General'}</Badge>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <span className="font-mono font-black text-blue-700 block">{b.available_copies} / {b.total_copies}</span>
                            <span className="text-[10px] text-emerald-600 font-bold">Available</span>
                          </TableCell>
                          <TableCell className="text-right pr-4 py-3">
                            <Button 
                              size="sm" 
                              onClick={() => handleOpenIssueModal(b)}
                              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 flex items-center gap-1 ml-auto shadow-sm"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{isUrdu ? '📤 اجرا کریں' : 'Issue Book'}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 2: ISSUED BOOKS LEDGER */}
        {activeTab === "issued" && (
          <Card className="border-blue-200 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/80 border-b border-blue-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                  {isUrdu ? 'اجرا شدہ کتب کا مکمل ہسٹری لیجر' : 'Issued Books Circulation History Ledger'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-500">
                  {isUrdu ? 'عبدالمعیز اور تمام طلباء کے پاس موجود کتابوں اور واپسی کی تاریخوں کا لائیو ریکارڈ' : 'Track currently borrowed library books, member names, and return due dates'}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 border border-emerald-200">
                Active Issues: {issuedRecords.filter(r => r.status === 'Issued').length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="pl-4">Member Name & Role</TableHead>
                      <TableHead>Issued Book Title</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Return Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {issuedRecords.map((rec) => (
                      <TableRow key={rec.id} className="hover:bg-blue-50/30 border-b border-slate-100">
                        <TableCell className="pl-4 py-3">
                          <span className="font-black text-slate-900 block flex items-center gap-1.5 text-sm">
                            {rec.memberName}
                            {rec.memberName.includes("Abdul Mueez") && <Badge className="bg-blue-500 text-white text-[9px] py-0">FEATURED</Badge>}
                          </span>
                          <span className="text-[11px] text-blue-700 font-bold">{rec.memberRole}</span>
                        </TableCell>
                        <TableCell className="py-3 font-bold text-slate-800">{rec.bookTitle}</TableCell>
                        <TableCell className="py-3 font-mono font-bold text-slate-600">{rec.issueDate}</TableCell>
                        <TableCell className="py-3 font-mono font-bold text-rose-600">{rec.dueDate}</TableCell>
                        <TableCell className="py-3">
                          {rec.status === 'Issued' ? (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px]">
                              ISSUED (طالب علم کے پاس ہے) ✅
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                              RETURNED (واپس موصول) 📥
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3">
                          {rec.status === 'Issued' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReturnBook(rec.id, rec.bookTitle)}
                              className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-8 px-3 flex items-center gap-1 ml-auto"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isUrdu ? 'واپس موصول کریں' : 'Mark Returned'}</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
