import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import getIcon from '../utils/iconUtils';
import { fetchAllRecipes, createRecipe, deleteRecipe } from '../services/recipeService';
import { createIngredients } from '../services/ingredientService';
import { createInstructions } from '../services/instructionService';
import MainFeature from '../components/MainFeature';

// Home page component that displays recipes
const Home = forwardRef(({ recipeFormRef }, ref) => {
  // State for recipes and UI
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    imageUrl: '',
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    difficultyLevel: 'Medium',
    categories: []
  });
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [instructions, setInstructions] = useState([{ step: '', sequence: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  
  // Icons
  const SearchIcon = getIcon('Search');
  const PlusIcon = getIcon('Plus');
  const MinusIcon = getIcon('Minus');
  const ChevronDownIcon = getIcon('ChevronDown');
  const ClockIcon = getIcon('Clock');
  const UsersIcon = getIcon('Users');
  const AlertTriangleIcon = getIcon('AlertTriangle');
  const XIcon = getIcon('X');
  const TrashIcon = getIcon('Trash');
  
  // Categories for recipes
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' }
  ];
  
  // Difficulty levels for recipes
  const difficultyLevels = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];

  // Load recipes when component mounts or when search/filter changes
  useEffect(() => {
    loadRecipes();
  }, [searchTerm, category]);

  // Function to load recipes with proper error handling
  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllRecipes(searchTerm, category);
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Expose the recipe form methods to parent components
  useImperativeHandle(recipeFormRef, () => ({
    openForm: () => {
      setShowRecipeForm(true);
    }
  }));
  
  // Add ingredient field
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };
  
  // Remove ingredient field
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };
  
  // Update ingredient field
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  
  // Add instruction field
  const addInstruction = () => {
    setInstructions([...instructions, { step: '', sequence: instructions.length + 1 }]);
  };
  
  // Remove instruction field
  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = [...instructions];
      newInstructions.splice(index, 1);
      // Update sequence numbers
      newInstructions.forEach((instruction, idx) => {
        instruction.sequence = idx + 1;
      });
      setInstructions(newInstructions);
    }
  };
  
  // Update instruction field
  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index].step = value;
    setInstructions(newInstructions);
  };
  
  // Handle form submission with service integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate form
      if (!newRecipe.title.trim()) {
        toast.error('Please enter a recipe title');
        setSubmitting(false);
        return;
      }
      
      // Create the recipe
      const recipeResult = await createRecipe(newRecipe);
      
      if (!recipeResult || !recipeResult.Id) {
        throw new Error('Failed to create recipe');
      }
      
      const recipeId = recipeResult.Id;
      
      // Create ingredients
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim());
      if (validIngredients.length > 0) {
        await createIngredients(recipeId, validIngredients);
      }
      
      // Create instructions
      const validInstructions = instructions.filter(ins => ins.step.trim());
      if (validInstructions.length > 0) {
        await createInstructions(recipeId, validInstructions);
      }
      
      // Success
      toast.success('Recipe created successfully!');
      setShowRecipeForm(false);
      
      // Reset form
      setNewRecipe({
        title: '',
        description: '',
        imageUrl: '',
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        difficultyLevel: 'Medium',
        categories: []
      });
      setIngredients([{ name: '', amount: '' }]);
      setInstructions([{ step: '', sequence: 1 }]);
      
      // Reload recipes
      loadRecipes();
    } catch (err) {
      toast.error(`Failed to create recipe: ${err.message}`);
      console.error('Error creating recipe:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle recipe deletion
  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(recipeId);
        toast.success('Recipe deleted successfully');
        loadRecipes();
      } catch (err) {
        toast.error('Failed to delete recipe');
        console.error('Error deleting recipe:', err);
      }
    }
  };
  
  // Handle category selection in new recipe form
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setNewRecipe(prev => {
      const categories = [...prev.categories];
      const index = categories.indexOf(value);
      
      if (index === -1) {
        categories.push(value);
      } else {
        categories.splice(index, 1);
      }
      
      return { ...prev, categories };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MainFeature />
      
      {/* Recipe Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="relative w-full md:w-auto flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
        </div>
        
        <div className="w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-surface-200 border-t-primary"></div>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Loading recipes...</p>
        </div>
      )}
      
      {/* Recipes Grid */}
      {!loading && recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-surface-600 dark:text-surface-400 mb-4">No recipes found. Try adjusting your search or create a new recipe.</p>
          <button 
            onClick={() => setShowRecipeForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-card dark:shadow-none border border-surface-200 dark:border-surface-700 overflow-hidden"
            >
              {recipe.imageUrl ? (
                <div className="w-full h-48 bg-surface-100 dark:bg-surface-700 relative overflow-hidden">
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                  <span className="text-surface-400 dark:text-surface-500">No image</span>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
                  {recipe.title || recipe.Name}
                </h2>
                
                <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-2">
                  {recipe.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-surface-500 dark:text-surface-400 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{recipe.prepTime + recipe.cookTime || 0} min</span>
                  </div>
                  
                  <div className="flex items-center text-surface-500 dark:text-surface-400 text-sm">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    <span>{recipe.servings || 4} servings</span>
                  </div>
                </div>
                
                {recipe.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.categories.split(',').map((category, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => handleDeleteRecipe(recipe.Id)}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors mt-2"
                >
                  Delete Recipe
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Home;