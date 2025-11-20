import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Home, Book, User, X } from 'lucide-react'
import './index.css'

const bookData = [
  { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata', cover: '/laskar-pelangi.jpg' },
  { id: 2, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', cover: '/bumi-manusia.jpg' },
  { id: 3, title: 'Cantik Itu Luka', author: 'Eka Kurniawan', cover: '/cantik-itu-luka.jpg' },
];

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
          const sw = e.target
          if (sw.state === 'activated') {
            registerPeriodicSync(period, swUrl, r)
          }
        })
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div role="alert" className="p-4 rounded-lg shadow-lg bg-white border border-gray-200 min-w-[320px] max-w-md">
        <div className="mb-3 text-sm text-gray-700">
          {offlineReady ? (
            <span>Aplikasi siap bekerja offline!</span>
          ) : (
            <span>Konten baru tersedia, klik 'Reload' untuk update.</span>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          {needRefresh && (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md"
            onClick={() => close()}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) {
      await r.update()
    }
  }, period)
}


function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Selamat Datang di Pojok Baca!</h1>
      <p className="text-lg text-gray-600">
        intinya, ini adalah aplikasi pwa sederhana ya ges ya
      </p>
      <p className="mt-4 text-gray-600">
        Gunakan navigasi di atas/bawah untuk berpindah halaman.
      </p>
    </div>
  )
}

function BooksPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daftar Buku Saya</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookData.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className='aspect-[2/3] w-full'>
              <img src={book.cover} alt={`Cover ${book.title}`} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Pengguna</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nama</label>
            <p className="text-lg font-semibold text-gray-800">Muhammad Danial Irfani</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">NIM</label>
            <p className="text-lg font-semibold text-gray-800">21120123130061</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Kelompok</label>
            <p className="text-lg font-semibold text-gray-800">24</p>
          </div>
        </div>
      </div>
    </div>
  )
}


function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'books', label: 'Buku', icon: Book },
    { id: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="flex justify-around max-w-3xl mx-auto md:py-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full p-3 transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}



function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'books':
        return <BooksPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      </div>

      <main className="pb-20 md:pt-16 md:pb-0">
        {renderCurrentPage()}
      </main>

      <div className="block md:hidden">
        <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      </div>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
