"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Bookmark, 
  Quote, 
  StickyNote, 
  Star,
  Clock,
  Library,
  LogOut,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Tables } from "@/database.types";

type Book = Tables<"books"> & {
  annotations_count?: {
    highlights: number;
    quotes: number;
    notes: number;
  }
};

export default function ReadingList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  const supabase = createClient();
  const router = useRouter();

  const fetchBooks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    let query = supabase
      .from("books")
      .select(`
        *,
        annotations(type)
      `)
      .order("updated_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching books:", error);
    } else {
      const booksWithCounts = data.map((book: any) => ({
        ...book,
        annotations_count: {
          highlights: book.annotations.filter((a: any) => a.type === "highlight").length,
          quotes: book.annotations.filter((a: any) => a.type === "quote").length,
          notes: book.annotations.filter((a: any) => a.type === "note").length,
        }
      }));
      setBooks(booksWithCounts);
    }
    setLoading(false);
  }, [supabase, filter, router]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] pb-20 md:pb-0">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Lumina</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={<Library className="w-4 h-4" />} label="Library" active={filter === "all"} onClick={() => setFilter("all")} />
          <NavItem icon={<Clock className="w-4 h-4" />} label="Reading" active={filter === "reading"} onClick={() => setFilter("reading")} />
          <NavItem icon={<Bookmark className="w-4 h-4" />} label="Finished" active={filter === "finished"} onClick={() => setFilter("finished")} />
          <NavItem icon={<Quote className="w-4 h-4" />} label="Want to Read" active={filter === "want_to_read"} onClick={() => setFilter("want_to_read")} />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.user_metadata?.full_name || user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="relative flex-1 max-w-96 mx-4 md:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-4 md:py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Add Book</span>
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {filter === "all" ? "My Library" : filter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h2>
              <p className="text-gray-500 mt-1">You have {filteredBooks.length} books in this view.</p>
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Library className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No books found</h3>
              <p className="text-gray-500 max-w-xs text-center mt-1">Start building your library by adding your first book.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 text-indigo-600 font-bold hover:underline flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add a book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onClick={() => setSelectedBook(book)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center md:hidden z-40">
        <MobileNavItem icon={<Library className="w-6 h-6" />} active={filter === "all"} onClick={() => setFilter("all")} />
        <MobileNavItem icon={<Clock className="w-6 h-6" />} active={filter === "reading"} onClick={() => setFilter("reading")} />
        <MobileNavItem icon={<Bookmark className="w-6 h-6" />} active={filter === "finished"} onClick={() => setFilter("finished")} />
        <MobileNavItem icon={<Quote className="w-6 h-6" />} active={filter === "want_to_read"} onClick={() => setFilter("want_to_read")} />
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetail 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
            onUpdate={fetchBooks}
          />
        )}
        {isAddModalOpen && (
          <AddBookModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchBooks();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl transition-all",
        active ? "text-indigo-600 bg-indigo-50" : "text-gray-400"
      )}
    >
      {icon}
    </button>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-indigo-50 text-indigo-600" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function BookCard({ book, onClick }: { book: Book, onClick: () => void }) {
  return (
    <motion.div 
      layoutId={`book-${book.id}`}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-all bg-gray-100">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </div>
        <div className="flex-1 flex flex-col py-1">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
              {book.category || "Uncategorized"}
            </span>
            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{book.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${book.progress}%` }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="flex items-center gap-1 text-gray-400">
            <Bookmark className="w-3.5 h-3.5" />
            <span className="text-xs">{book.annotations_count?.highlights || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Quote className="w-3.5 h-3.5" />
            <span className="text-xs">{book.annotations_count?.quotes || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3 h-3", i < (book.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AddBookModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    cover_url: "",
    status: "reading" as const
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("books").insert({
      ...formData,
      user_id: user.id
    });

    if (error) {
      alert(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add New Book</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="The Great Gatsby"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="F. Scott Fitzgerald"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="Fiction"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
                <option value="want_to_read">Want to Read</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (Optional)</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="https://..."
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Library"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function BookDetail({ book, onClose, onUpdate }: { book: Book, onClose: () => void, onUpdate: () => void }) {
  const [activeTab, setActiveTab] = useState<"highlight" | "quote" | "note">("highlight");
  const [annotations, setAnnotations] = useState<Tables<"annotations">[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState(book.progress || 0);
  const supabase = createClient();

  const fetchAnnotations = useCallback(async () => {
    const { data, error } = await supabase
      .from("annotations")
      .select("*")
      .eq("book_id", book.id)
      .order("created_at", { ascending: false });

    if (!error) setAnnotations(data);
    setLoading(false);
  }, [supabase, book.id]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim()) return;
    setIsAdding(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("annotations").insert({
      book_id: book.id,
      user_id: user.id,
      content: newAnnotation,
      type: activeTab
    });

    if (!error) {
      setNewAnnotation("");
      fetchAnnotations();
      onUpdate();
    }
    setIsAdding(false);
  };

  const handleUpdateProgress = async () => {
    const { error } = await supabase
      .from("books")
      .update({ progress })
      .eq("id", book.id);
    
    if (!error) onUpdate();
  };

  const handleDeleteBook = async () => {
    if (confirm("Are you sure you want to delete this book?")) {
      const { error } = await supabase.from("books").delete().eq("id", book.id);
      if (!error) {
        onUpdate();
        onClose();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`book-${book.id}`}
        className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/3 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100 overflow-y-auto">
          <div className="relative group">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-48 h-72 object-cover rounded-xl shadow-2xl mb-6" />
            ) : (
              <div className="w-48 h-72 bg-white rounded-xl shadow-2xl mb-6 flex items-center justify-center border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-200" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 line-clamp-2">{book.title}</h2>
          <p className="text-gray-500 mb-6">{book.author}</p>
          
          <div className="w-full space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Reading Progress</span>
                <span className="font-bold text-indigo-600">{progress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                onMouseUp={handleUpdateProgress}
                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteBook}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-4">
              {(['highlight', 'quote', 'note'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-sm font-bold transition-all pb-1 capitalize",
                    activeTab === tab ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {tab}s
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder={`Add a new ${activeTab}...`}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-24"
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                />
                <button 
                  onClick={handleAddAnnotation}
                  disabled={isAdding || !newAnnotation.trim()}
                  className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : annotations.filter(a => a.type === activeTab).length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No {activeTab}s yet.
                  </div>
                ) : (
                  annotations.filter(a => a.type === activeTab).map((annotation) => (
                    <div key={annotation.id} className="group relative p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                      <p className={cn(
                        "text-gray-800 leading-relaxed",
                        activeTab === 'quote' && "italic"
                      )}>
                        {activeTab === 'quote' ? `"${annotation.content}"` : annotation.content}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                          {new Date(annotation.created_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
