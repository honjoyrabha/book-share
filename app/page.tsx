'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  location: string;
  condition: string;
  donor_name: string;
  contact: string;
  image: string;
}

const CATEGORIES = ['All', 'Textbooks', 'Self-Help', 'Fiction', 'Competitive Exams'];

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Textbooks',
    location: '',
    condition: 'Like New',
    donor_name: '',
    contact: '',
    image: '',
  });

  // 1. Fetch books from Supabase when the page loads
  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
    } else if (data) {
      setBooks(data as Book[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Save a new book to Supabase
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.location || !formData.contact) {
      alert('Please fill in all required fields!');
      return;
    }

    setSubmitting(true);

    const fallbackImage =
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60';

    const { error } = await supabase.from('books').insert([
      {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
        donor_name: formData.donor_name || 'Generous Donor',
        contact: formData.contact,
        image: formData.image.trim() !== '' ? formData.image : fallbackImage,
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert('Failed to save book. Error: ' + error.message);
      return;
    }

    // Refresh the books list & close modal
    fetchBooks();
    setIsModalOpen(false);

    // Reset the form
    setFormData({
      title: '',
      author: '',
      category: 'Textbooks',
      location: '',
      condition: 'Like New',
      donor_name: '',
      contact: '',
      image: '',
    });
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold tracking-tight text-emerald-700">Book Share</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            + Donate a Book
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-emerald-800 text-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Give your books a second life.
          </h1>
          <p className="text-emerald-100 text-base md:text-lg mb-8">
            Connect with people nearby to donate books you don't need or find books you want to read — completely free.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto flex items-center bg-white rounded-xl p-2 shadow-lg">
            <span className="text-slate-400 pl-3 pr-2 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search by title, author, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-slate-800 outline-none placeholder-slate-400 text-sm md:text-base pr-3"
            />
          </div>
        </div>
      </section>

      {/* 3. Main Content: Category Filters & Book Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg font-medium">Loading books from database...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 p-8">
            <p className="text-4xl mb-2">📖</p>
            <h3 className="text-lg font-semibold text-slate-700">No books found</h3>
            <p className="text-slate-500 text-sm mb-4">
              Be the first to donate a book to your community!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Donate the First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Book Image */}
                <div className="h-48 bg-slate-100 overflow-hidden relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    {book.condition}
                  </span>
                </div>

                {/* Book Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug mt-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-0.5 line-clamp-1">by {book.author}</p>
                    <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                      📍 {book.location}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 line-clamp-1">By {book.donor_name}</span>
                    <a
                      href={`https://wa.me/${book.contact.replace(/[^0-9]/g, '')}?text=Hi,%20I%20saw%20your%20book%20'${encodeURIComponent(book.title)}'%20on%20Book%20Share!%20Is%20it%20still%20available?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors text-center inline-block"
                    >
                      Request (WhatsApp)
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. DONATE BOOK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Donate a Book</h2>
            <p className="text-sm text-slate-500 mb-4">
              Help someone read by sharing a book you no longer need.
            </p>

            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Book Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Sapiens"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="e.g. Yuval Noah Harari"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                  >
                    <option value="Textbooks">Textbooks</option>
                    <option value="Self-Help">Self-Help</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City / Area *</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Rohini, Delhi"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    name="donor_name"
                    placeholder="e.g. John"
                    value={formData.donor_name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    name="contact"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Book Image URL (Optional)</label>
                <input
                  type="url"
                  name="image"
                  placeholder="Paste an image link or leave blank"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-slate-200 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Post Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}