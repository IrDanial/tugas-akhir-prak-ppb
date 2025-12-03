import React, { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useRegisterSW } from 'virtual:pwa-register/react'
// Menambahkan icon Plus dan X
import { Home, Book, User, Layers, ArrowLeft, Plus, X } from 'lucide-react'
import './index.css'

// const API_BASE_URL = 'https://ta-ppb-backend.vercel.app/api';
const API_BASE_URL = 'http://localhost:3001/api';

// --- KOMPONEN PWABadge ---
function PWABadge() {
  const period = 60 * 60 * 1000 
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })
  function close() { setOfflineReady(false); setNeedRefresh(false); }
  if (!offlineReady && !needRefresh) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 p-4 rounded-lg shadow-lg bg-white border border-gray-200 max-w-[300px]">
      <div className="mb-2 text-sm text-gray-700">
        {offlineReady ? <span>Aplikasi siap bekerja offline!</span> : <span>Konten baru tersedia!</span>}
      </div>
      <div className="flex gap-2 justify-end">
        {needRefresh && <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded" onClick={() => updateServiceWorker(true)}>Reload</button>}
        <button className="px-3 py-1 bg-gray-200 text-xs rounded" onClick={() => close()}>Tutup</button>
      </div>
    </div>
  )
}
function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return
  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return
    const resp = await fetch(swUrl, { cache: 'no-store', headers: { 'cache': 'no-store', 'cache-control': 'no-cache' } })
    if (resp?.status === 200) await r.update()
  }, period)
}

// --- KOMPONEN MODAL TAMBAH BUKU (BARU) ---
function AddBookModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', author: '', year: '', description: '', cover_url: '', category_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil kategori untuk dropdown
  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_URL}/categories`)
        .then(res => res.json())
        .then(data => setCategories(data));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Buku berhasil ditambahkan!');
        setFormData({ title: '', author: '', year: '', description: '', cover_url: '', category_id: '' });
        onSuccess(); // Refresh daftar buku
        onClose();   // Tutup modal
      } else {
        alert('Gagal menambahkan buku.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tambah Buku Baru</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Judul Buku</label>
            <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Penulis</label>
            <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Tahun</label>
              <input required type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Kategori</label>
              <select required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                <option value="">Pilih...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">URL Cover Gambar</label>
            <input required type="url" placeholder="https://..." className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Sinopsis</label>
            <textarea required rows="3" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          
          <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Buku'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- HALAMAN 1: HOME ---
function HomePage({ onNavigate }) {
  return (
    <div className="p-6 pt-10">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white shadow-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang! 👋</h1>
        <p className="text-blue-100">Di Pojok Baca PWA. Temukan koleksi buku favoritmu di sini.</p>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Akses Cepat</h2>
      <div className="grid grid-cols-2 gap-4">
         {/* TOMBOL 1: LIHAT BUKU */}
         <div 
            onClick={() => onNavigate('books')}
            className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center text-center h-32 cursor-pointer hover:scale-105 transition-transform active:bg-gray-50"
         >
            <Book className="w-8 h-8 text-blue-500 mb-2" />
            <span className="font-medium text-gray-700">Lihat Buku</span>
         </div>

         {/* TOMBOL 2: KATEGORI */}
         <div 
            onClick={() => onNavigate('categories')}
            className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center text-center h-32 cursor-pointer hover:scale-105 transition-transform active:bg-gray-50"
         >
            <Layers className="w-8 h-8 text-purple-500 mb-2" />
            <span className="font-medium text-gray-700">Kategori</span>
         </div>
      </div>
    </div>
  )
}

// --- HALAMAN 2: DAFTAR BUKU (DIUPDATE) ---
function BooksPage({ onNavigate }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal

  const fetchBooks = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/books`)
      .then(res => res.json())
      .then(data => { setBooks(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="p-6 pb-24 pt-10 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Semua Buku</h1>
      </div>

      {loading ? (
        <div className="p-10 text-center">Memuat buku...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {books.map((book) => (
            <div key={book.id} onClick={() => onNavigate('bookDetail', book.id)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <div className="aspect-[2/3] w-full bg-gray-200">
                 <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" 
                      onError={(e) => {e.target.src = 'https://placehold.co/400x600?text=No+Image'}} />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FLOATING ACTION BUTTON (TOMBOL TAMBAH) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-110 transition-all z-40 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* MODAL FORM */}
      <AddBookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBooks} 
      />
    </div>
  );
}

// --- HALAMAN 3: KATEGORI (List 2) ---
function CategoriesPage({ onNavigate }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <div className="p-6 pb-24 pt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Kategori</h1>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} onClick={() => onNavigate('categoryDetail', cat.id)} 
               className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50">
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                {cat.name.charAt(0)}
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
               <p className="text-sm text-gray-500">{cat.description || "Lihat koleksi"}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- HALAMAN 4: DETAIL BUKU (Detail 1) ---
function BookDetailPage({ bookId, onBack }) {
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (bookId) {
      fetch(`${API_BASE_URL}/books/${bookId}`)
        .then(res => res.json())
        .then(data => setBook(data));
    }
  }, [bookId]);

  if (!book) return <div className="p-10 text-center">Memuat detail...</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="relative h-72 bg-gray-900">
        <img src={book.cover_url} className="w-full h-full object-cover opacity-40" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/30">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute -bottom-16 left-6 w-32 shadow-2xl rounded-lg overflow-hidden border-4 border-white">
          <img src={book.cover_url} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="pt-20 px-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{book.title}</h1>
        <p className="text-blue-600 font-medium mt-2">{book.author} • {book.year}</p>
        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-2">Sinopsis</h3>
          <p className="text-gray-600 leading-relaxed text-sm text-justify">{book.description || "Belum ada deskripsi."}</p>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
           <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Kategori</span>
           <p className="text-gray-800 font-medium">{book.categories?.name || '-'}</p>
        </div>
      </div>
    </div>
  );
}

// --- HALAMAN 5: DETAIL KATEGORI (Detail 2) ---
function CategoryDetailPage({ catId, onBack, onNavigate }) {
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if(catId) {
      fetch(`${API_BASE_URL}/books?cat_id=${catId}`)
        .then(res => res.json())
        .then(data => {
            setBooks(data);
            if(data.length > 0) setCategoryName(data[0].categories.name);
        });
    }
  }, [catId]);

  return (
    <div className="p-6 pt-10 pb-24 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="flex items-center text-gray-600 mb-4 font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
      </button>
      <h1 className="text-2xl font-bold mb-1">Kategori: {categoryName || '...'}</h1>
      <p className="text-gray-500 text-sm mb-6">Menampilkan {books.length} buku</p>
      
      <div className="grid grid-cols-2 gap-4">
        {books.length === 0 && <p className="text-gray-500 col-span-2 text-center mt-10">Belum ada buku di kategori ini.</p>}
        {books.map((book) => (
          <div key={book.id} onClick={() => onNavigate('bookDetail', book.id)} className="bg-white rounded-lg shadow cursor-pointer overflow-hidden">
             <div className="aspect-[2/3] w-full bg-gray-200">
                <img src={book.cover_url} className="w-full h-full object-cover" onError={(e) => {e.target.src = 'https://placehold.co/400x600?text=No+Image'}} />
             </div>
             <div className="p-3">
               <h3 className="font-bold text-sm truncate">{book.title}</h3>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- HALAMAN 6: PROFIL ---
function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/profile`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, []);

  if (!profile) return <div className="p-10 text-center">Memuat profil...</div>;

  return (
    <div className="p-6 pt-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <img src={profile.avatar_url} className="w-28 h-28 rounded-full mx-auto border-4 border-blue-50 mb-4 object-cover shadow-sm" onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}} />
        <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
        <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold mt-2">{profile.student_id}</div>
        <p className="text-gray-500 text-sm mt-2">{profile.group_name}</p>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-600 italic leading-relaxed">"{profile.bio}"</p>
        </div>
      </div>
    </div>
  );
}

// --- NAVBAR ---
function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'books', label: 'Buku', icon: Book },
    { id: 'categories', label: 'Kategori', icon: Layers }, // Menu Baru
    { id: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-around max-w-3xl mx-auto py-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id || (currentPage === 'bookDetail' && item.id === 'books') || (currentPage === 'categoryDetail' && item.id === 'categories');
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center justify-center w-full p-2 transition-colors ${isActive ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-blue-400'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// --- ROOT APP ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedId, setSelectedId] = useState(null);

  const handleNavigation = (page, id = null) => {
    setCurrentPage(page);
    if (id) setSelectedId(id);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigation} />;
      case 'books': return <BooksPage onNavigate={handleNavigation} />;
      case 'bookDetail': return <BookDetailPage bookId={selectedId} onBack={() => handleNavigation('books')} />;
      case 'categories': return <CategoriesPage onNavigate={handleNavigation} />;
      case 'categoryDetail': return <CategoryDetailPage catId={selectedId} onBack={() => handleNavigation('categories')} onNavigate={handleNavigation} />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <main className="md:max-w-md md:mx-auto md:bg-white md:min-h-screen md:shadow-2xl">
        {renderPage()}
      </main>
      <div className="md:hidden">
         <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      </div>
      {/* Navbar Desktop Mode (Optional, disembunyikan di mobile) */}
      <div className="hidden md:block md:fixed md:bottom-0 md:left-0 md:right-0 md:max-w-md md:mx-auto">
         <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      </div>
      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)