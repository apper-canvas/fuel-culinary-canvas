import { useState, useEffect, useRef, createContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './store/userSlice';
import getIcon from './utils/iconUtils';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const recipeFormRef = useRef(null);
  
  // Get authentication status
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Icons
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const MenuIcon = getIcon('Menu');
  const ChefHatIcon = getIcon('ChefHat');
  const LogOutIcon = getIcon('LogOut');
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', !isDarkMode);
  };
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
          '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        navigate('/error');
      }
    });
  }, [dispatch, navigate]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Logout handler
  const handleLogout = async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      await ApperUI.logout();
      dispatch(clearUser());
      navigate('/login');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  
  const openRecipeForm = () => {
    if (recipeFormRef.current) {
      recipeFormRef.current.openForm();
    }
  };

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: handleLogout
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="text-center">
        <ChefHatIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
        <p className="mt-4 text-surface-600 dark:text-surface-300">Initializing application...</p>
      </div>
    </div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && (
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
                    <li>
                      <a 
                        href="/" 
                        className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition">Recipes</a>
                    </li>
                    <li>
                      <button 
                        onClick={openRecipeForm} 
                        className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition bg-transparent">
                        New Recipe
                      </button>
                    </li>
                  </ul>
                </nav>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition"
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition flex items-center gap-1"
                    aria-label="Logout"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
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
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      openRecipeForm();
                      setIsMenuOpen(false);
                    }}
                    className="text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary transition py-2">
                    New Recipe
                  </a>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-surface-700 dark:text-surface-300">Dark Mode</span>
                    <button 
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full bg-surface-100 dark:bg-surface-700"
                      aria-label="Toggle dark mode"
                    >
                      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary py-2"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </motion.div>
            )}
          </header>
        )}
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={isAuthenticated ? <Home recipeFormRef={recipeFormRef} /> : <Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {isAuthenticated && (
          <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-6 mt-8">
            <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400 text-sm">
              © {new Date().getFullYear()} CulinaryCanvas. All recipes are stored in your personal account.
            </div>
          </footer>
        )}
        
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
    </AuthContext.Provider>
  );
}

export default App;