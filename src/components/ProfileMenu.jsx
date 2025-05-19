import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../App';
import { fetchUserRecipes } from '../services/recipeService';
import getIcon from '../utils/iconUtils';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [sharedRecipes, setSharedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Icons
  const UserIcon = getIcon('User');
  const SettingsIcon = getIcon('Settings');
  const LogOutIcon = getIcon('LogOut');
  const ClockIcon = getIcon('Clock');
  const ShareIcon = getIcon('Share2');
  const ChevronDownIcon = getIcon('ChevronDown');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user-specific recipes when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      const loadUserRecipes = async () => {
        setIsLoading(true);
        try {
          // Fetch recent recipes (limit to 3)
          const recentResponse = await fetchUserRecipes({
            limit: 3,
            orderBy: [{ field: 'ModifiedOn', direction: 'DESC' }]
          });
          
          // Fetch recipes shared by the user
          const sharedResponse = await fetchUserRecipes({
            limit: 3,
            where: [{ fieldName: 'Owner', operator: 'ExactMatch', values: [user.id] }]
          });
          
          setRecentRecipes(recentResponse || []);
          setSharedRecipes(sharedResponse || []);
        } catch (error) {
          console.error('Error fetching user recipes:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadUserRecipes();
    }
  }, [isOpen, user]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
          {user?.firstName?.[0] || user?.emailAddress?.[0] || 'U'}
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user?.firstName || user?.emailAddress?.split('@')[0] || 'User'}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 overflow-hidden z-30"
          >
            <div className="p-4 border-b border-surface-200 dark:border-surface-700">
              <p className="font-medium">{user?.firstName || 'User'}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">{user?.emailAddress || 'user@example.com'}</p>
            </div>
            
            <div className="p-2">
              <button onClick={() => handleNavigate('/settings')} className="w-full text-left px-4 py-2 flex items-center gap-3 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition">
                <SettingsIcon className="h-5 w-5" />
                <span>Settings</span>
              </button>
              
              <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-700 mt-1">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4" /> Recently Viewed
                </h3>
                {isLoading ? <p className="text-sm text-surface-500">Loading...</p> : 
                  recentRecipes.length > 0 ? recentRecipes.map(recipe => (
                    <button key={recipe.Id} onClick={() => handleNavigate(`/recipe/${recipe.Id}`)} className="text-sm block w-full text-left py-1 px-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300">{recipe.title || recipe.Name}</button>
                  )) : <p className="text-sm text-surface-500">No recent recipes</p>
                }
              </div>
              
              <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-700">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <ShareIcon className="h-4 w-4" /> Shared by Me
                </h3>
                {isLoading ? <p className="text-sm text-surface-500">Loading...</p> : 
                  sharedRecipes.length > 0 ? sharedRecipes.map(recipe => (
                    <button key={recipe.Id} onClick={() => handleNavigate(`/recipe/${recipe.Id}`)} className="text-sm block w-full text-left py-1 px-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300">{recipe.title || recipe.Name}</button>
                  )) : <p className="text-sm text-surface-500">No shared recipes</p>
                }
              </div>
              
              <button onClick={logout} className="w-full text-left px-4 py-2 flex items-center gap-3 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-red-600 dark:text-red-400 transition mt-1 border-t border-surface-200 dark:border-surface-700">
                <LogOutIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;