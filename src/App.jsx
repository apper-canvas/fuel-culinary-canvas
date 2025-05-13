import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import getIcon from './utils/iconUtils';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Icons
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const MenuIcon = getIcon('Menu');
  const ChefHatIcon = getIcon('ChefHat');
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', !isDarkMode);
  };
  
  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChefHatIcon className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CulinaryCanvas
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex items-center gap-6">
                <li><a href="/" className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition">Recipes</a></li>
                <li><a href="#features" className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition">New Recipe</a></li>
              </ul>
            </nav>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
          
          <button 
            className="md:hidden p-2 rounded-full bg-surface-100 dark:bg-surface-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-surface-800 px-4 py-3 border-t border-surface-200 dark:border-surface-700"
          >
            <nav className="flex flex-col gap-4">
              <a href="/" className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition py-2">
                Recipes
              </a>
              <a href="#features" className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition py-2">
                New Recipe
              </a>
              <div className="flex items-center gap-2 py-2">
                <span className="text-surface-700 dark:text-surface-300">Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-surface-100 dark:bg-surface-700"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400 text-sm">
          © {new Date().getFullYear()} CulinaryCanvas. All recipes are stored locally in your browser.
        </div>
      </footer>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastClassName="rounded-xl shadow-lg"
      />
    </div>
  );
}

export default App;