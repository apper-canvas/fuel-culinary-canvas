import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { fetchAllRecipes, deleteRecipe } from '../services/recipeService';
import { fetchIngredientsByRecipeId } from '../services/ingredientService';
import { fetchInstructionsByRecipeId } from '../services/instructionService';
import MainFeature from '../components/MainFeature';
import { AnimatePresence } from 'framer-motion';
import getIcon from '../utils/iconUtils';

// Homepage component
function Home({ recipeFormRef }) {
  // Icon declarations
  const UtensilsIcon = getIcon('Utensils');
  const SearchIcon = getIcon('Search');
  const FilterIcon = getIcon('Filter');
  const BookOpenIcon = getIcon('BookOpen');
  const Clock = getIcon('Clock');
  const ChefHat = getIcon('ChefHat');
  const XIcon = getIcon('X');
  
  // State for viewing a recipe
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [viewingIngredients, setViewingIngredients] = useState([]);
  const [viewingInstructions, setViewingInstructions] = useState([]);
  
  // State for recipes
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Get the user from Redux store
  const { user } = useSelector((state) => state.user);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'dessert', name: 'Dessert' },
    { id: 'snack', name: 'Snack' }
  ];
  
  // View recipe details
  const handleViewRecipe = async (recipe) => {
    try {
      setIsLoadingDetails(true);
      setViewingRecipe(recipe);
      
      // Fetch ingredients and instructions for this recipe
      const [ingredientsData, instructionsData] = await Promise.all([
        fetchIngredientsByRecipeId(recipe.Id),
        fetchInstructionsByRecipeId(recipe.Id)
      ]);
      
      setViewingIngredients(ingredientsData);
      setViewingInstructions(instructionsData);
      setIsLoadingDetails(false);
    } catch (error) {
      console.error("Error loading recipe details:", error);
      toast.error("Failed to load recipe details");
      setIsLoadingDetails(false);
    }
  };
  
  const handleAddRecipe = async (recipe) => {
    // The recipe is already saved in the backend by MainFeature component
    // We just need to refresh the recipes list
    try {
      setIsLoading(true);
      const recipesData = await fetchAllRecipes(searchTerm, activeFilter);
      setRecipes(recipesData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing recipes:", error);
      setIsLoading(false);
      toast.error("Failed to refresh recipes list");
    }
  };
  
  // Close recipe details modal
  const closeRecipeDetails = () => {
    setViewingRecipe(null);
    setViewingIngredients([]);
    setViewingInstructions([]);
  };
  
  // Confirm and delete recipe
  const confirmDeleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }
    
    try {
      await deleteRecipe(id);
      
      // Close the detail view if we're deleting the recipe we're viewing
      if (viewingRecipe && viewingRecipe.Id === id) {
        closeRecipeDetails();
      }
      
      // Refresh the recipes list
      setIsLoading(true);
      const recipesData = await fetchAllRecipes(searchTerm, activeFilter);
      setRecipes(recipesData);
      setIsLoading(false);
      
      toast.success("Recipe deleted!");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    }
  };
  
  // Fetch recipes when component mounts or filters change
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        const recipesData = await fetchAllRecipes(searchTerm, activeFilter);
        setRecipes(recipesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading recipes:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };
    
    loadRecipes();
  }, [searchTerm, activeFilter]);
  
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
      <MainFeature ref={recipeFormRef} onAddRecipe={handleAddRecipe} />
      
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes or ingredients..."
              className="input-field pl-10 pr-4 py-2 w-full md:w-60 lg:w-80"
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
      {/* Loading state */}
      {isLoading && (
        <div className="w-full flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="w-full flex flex-col items-center justify-center my-12 text-center">
          <div className="text-red-500 mb-4">
            {getIcon('AlertTriangle')({ className: "h-12 w-12 mx-auto" })}
          </div>
          <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">
            Error Loading Recipes
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            There was a problem loading your recipes. Please try again later.
          </p>
        </div>
      )}
      
      {/* Recipe Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <motion.div
                key={recipe.Id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="recipe-card group"
              >
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{recipe.title}</h3>
                <div className="relative rounded-xl overflow-hidden h-48 mb-4">
                  <img 
                    src={recipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";
                    }}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-2 mb-2">
                      {recipe.categories && recipe.categories.split(',').map(cat => (
                        <span key={cat} className="text-xs font-medium bg-primary/80 text-white px-2 py-1 rounded-full">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
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
                  {recipe.description || "No description available."}
                </p>
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => handleViewRecipe(recipe)} 
                    className="btn btn-outline text-sm">View Recipe</button>
                  <button 
                    onClick={() => confirmDeleteRecipe(recipe.Id)}
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
      )}
      
      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {viewingRecipe && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeRecipeDetails}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-64 md:h-80">
                <img 
                  src={viewingRecipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";
                  }}
                  alt={viewingRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <button 
                  onClick={closeRecipeDetails}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Close recipe details"
                >
                  <XIcon className="h-5 w-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex gap-2 mb-2">
                    {viewingRecipe.categories && viewingRecipe.categories.split(',').map(cat => (
                      <span key={cat} className="text-xs font-medium bg-primary/80 text-white px-2 py-1 rounded-full">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{viewingRecipe.title}</h2>
                </div>
              </div>
              
              {isLoadingDetails ? (
                // Loading state for details
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-surface-600 dark:text-surface-400">Loading recipe details...</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex gap-6 mb-6 flex-wrap">
                    <div className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                      <Clock className="h-5 w-5" />
                      <span>Prep: {viewingRecipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                      <Clock className="h-5 w-5" /> 
                      <span>Cook: {viewingRecipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                      <ChefHat className="h-5 w-5" />
                      <span>Difficulty: {viewingRecipe.difficultyLevel}</span>
                    </div>
                  </div>
                  
                  <p className="text-surface-700 dark:text-surface-300 mb-6">{viewingRecipe.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                     {getIcon('Egg')({ className: "h-5 w-5 text-primary" })}
                     <span>Ingredients</span>
                   </h3>
                   {viewingIngredients.length === 0 ? (
                     <p className="text-surface-500 dark:text-surface-400">No ingredients available.</p>
                   ) : (
                     <ul className="space-y-2">
                       {viewingIngredients.map((ing) => (
                         <li key={ing.Id} className="flex items-baseline gap-2">
                           <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                           <span>{ing.Name} {ing.amount && `- ${ing.amount}`}</span>
                         </li>
                       ))}
                     </ul>
                   )}
                 </div>
                 
                 <div>
                   <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                     {getIcon('ListOrdered')({ className: "h-5 w-5 text-primary" })}
                     <span>Instructions</span>
                   </h3>
                   {viewingInstructions.length === 0 ? (
                     <p className="text-surface-500 dark:text-surface-400">No instructions available.</p>
                   ) : (
                     <div className="space-y-4">
                       {viewingInstructions.map((inst) => (
                         <div key={inst.Id} className="flex gap-3">
                           <div className="bg-primary text-white rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center">
                             {inst.sequence || "?"}
                           </div>
                           <p className="text-surface-700 dark:text-surface-300">{inst.step}</p>
                         </div>
                       ))}
                      </div>
                    )}
                  </div>
                  </div>
                  <button 
                      onClick={closeRecipeDetails}
                      className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      confirmDeleteRecipe(viewingRecipe.Id);
                    }}
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete Recipe
                  </button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;