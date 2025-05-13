import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Homepage component
function Home() {
  // Icon declarations
  const UtensilsIcon = getIcon('Utensils');
  const SearchIcon = getIcon('Search');
  const FilterIcon = getIcon('Filter');
  const BookOpenIcon = getIcon('BookOpen');
  const Clock = getIcon('Clock');
  const ChefHat = getIcon('ChefHat');
  
  // State for recipes
  const [recipes, setRecipes] = useState(() => {
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      try {
        return JSON.parse(savedRecipes);
      } catch (e) {
        console.error("Error parsing saved recipes:", e);
        return [];
      }
    }
    return [];
  });
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);
  
  // Filter categories
  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'dessert', name: 'Dessert' },
    { id: 'snack', name: 'Snack' }
  ];
  
  // Filter recipes based on search term and active filter
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || recipe.categories.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle adding a new recipe
  const handleAddRecipe = (recipe) => {
    setRecipes([...recipes, {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }]);
    toast.success("Recipe added successfully!");
  };
  
  // Handle deleting a recipe
  const handleDeleteRecipe = (id) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
    toast.success("Recipe deleted!");
  };
  
  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Your Digital Recipe Collection
        </h1>
        <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
          Create, save, and organize your favorite recipes in one beautiful place.
          Never lose a recipe again!
        </p>
      </motion.div>
      
      {/* Main Feature Component - Recipe Form */}
      <MainFeature onAddRecipe={handleAddRecipe} />
      
      {/* Search and Filter Section */}
      <div className="mt-16 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpenIcon className="h-7 w-7 text-primary" />
            <span>Your Recipe Collection</span>
          </h2>
          
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              className="input-field pl-10 pr-4 py-2 w-full md:w-60 lg:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
          </div>
        </div>
        
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                ${activeFilter === category.id 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="recipe-card group"
            >
              <div className="relative rounded-xl overflow-hidden h-48 mb-4">
                <img 
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex gap-2 mb-2">
                    {recipe.categories.map(cat => (
                      <span key={cat} className="text-xs font-medium bg-primary/80 text-white px-2 py-1 rounded-full">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 line-clamp-1">{recipe.title}</h3>
              
              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{recipe.cookTime + recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                  <ChefHat className="h-4 w-4" />
                  <span className="text-sm">{recipe.difficultyLevel}</span>
                </div>
              </div>
              
              <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="flex justify-between items-center">
                <button className="btn btn-outline text-sm">View Recipe</button>
                <button 
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="p-2 text-surface-500 hover:text-red-500 transition-colors"
                  aria-label="Delete recipe"
                >
                  {getIcon('Trash2')({ className: "h-5 w-5" })}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <UtensilsIcon className="h-16 w-16 text-surface-300 dark:text-surface-600 mb-4" />
            <h3 className="text-xl font-medium text-surface-700 dark:text-surface-300 mb-1">No recipes found</h3>
            <p className="text-surface-500 dark:text-surface-400 max-w-md">
              {recipes.length === 0 
                ? "Start adding your favorite recipes using the form above." 
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;