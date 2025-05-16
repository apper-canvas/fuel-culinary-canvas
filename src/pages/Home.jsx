import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { AnimatePresence } from 'framer-motion';

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
    // Default recipe for Pasta Carbonara
    return [{ 
      id: '1001',
      title: 'Chocolate Cake',
      ingredients: [
        { name: 'all-purpose flour', amount: '2 cups', id: '1' },
        { name: 'sugar', amount: '2 cups', id: '2' },
        { name: 'cocoa powder', amount: '3/4 cup', id: '3' },
        { name: 'baking powder', amount: '2 tsp', id: '4' },
        { name: 'baking soda', amount: '1.5 tsp', id: '5' },
        { name: 'salt', amount: '1 tsp', id: '6' },
        { name: 'eggs', amount: '2', id: '7' },
        { name: 'milk', amount: '1 cup', id: '8' },
        { name: 'vegetable oil', amount: '1/2 cup', id: '9' },
        { name: 'vanilla extract', amount: '2 tsp', id: '10' },
        { name: 'boiling water', amount: '1 cup', id: '11' }
      ],
      instructions: [
        "1. Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.",
        "2. In a large bowl, combine flour, sugar, cocoa powder, baking powder, baking soda, and salt.",
        "3. Add eggs, milk, oil, and vanilla; beat for 2 minutes on medium speed.",
        "4. Stir in boiling water (batter will be thin). Pour into prepared pans.",
        "5. Bake for 30-35 minutes or until a toothpick inserted comes out clean.",
        "6. Cool in pans for 10 minutes, then remove to wire racks to cool completely."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1089&q=80',
      categories: ['dessert'],
      prepTime: 20,
      cookTime: 35,
      difficultyLevel: 'easy',
      createdAt: new Date().toISOString(),
      description: `A rich, moist chocolate cake that's perfect for any occasion. Simple to make and absolutely delicious.`
    },
    {
      id: '1002',
      title: 'Pasta Carbonara',
      ingredients: [
        { name: 'pasta', amount: '400g', id: '1' },
        { name: 'eggs', amount: '3 large', id: '2' },
        { name: 'pancetta', amount: '150g', id: '3' },
        { name: 'parmesan cheese', amount: '50g, grated', id: '4' },
        { name: 'black pepper', amount: 'to taste', id: '5' }
      ],
      instructions: [
        "1. Cook pasta in salted water according to package instructions until al dente.",
        "2. While pasta cooks, whisk eggs and grated parmesan in a bowl with fresh black pepper.",
        "3. Fry pancetta in a large pan until crispy.",
        "4. Drain pasta, reserving a little cooking water.",
        "5. Working quickly, combine hot pasta with pancetta, then remove from heat.",
        "6. Immediately add egg mixture, stirring constantly until creamy. Add a splash of pasta water if needed.",
        "7. Serve immediately with extra parmesan and pepper."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80',
      categories: ['dinner'],
      prepTime: 10,
      cookTime: 15,
      difficultyLevel: 'medium',
      createdAt: new Date().toISOString(),
      description: `A classic Italian pasta dish made with eggs, cheese, pancetta, and black pepper. Rich, creamy, and ready in under 30 minutes.`
    },
    {
      id: '1003',
      title: 'Avocado Toast',
      ingredients: [
        { name: 'ripe avocado', amount: '1', id: '1' },
        { name: 'bread slices', amount: '2', id: '2' },
        { name: 'lemon juice', amount: '1 tsp', id: '3' },
        { name: 'salt', amount: 'to taste', id: '4' },
        { name: 'pepper', amount: 'to taste', id: '5' },
        { name: 'red pepper flakes', amount: 'a pinch', id: '6' },
        { name: 'cherry tomatoes', amount: '4, halved', id: '7' }
      ],
      instructions: [
        "1. Toast bread slices until golden and crisp.",
        "2. Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.",
        "3. Add lemon juice, salt, and pepper to the avocado and mash with a fork to desired consistency.",
        "4. Spread the avocado mixture evenly on the toast.",
        "5. Top with halved cherry tomatoes and a sprinkle of red pepper flakes.",
        "6. Serve immediately."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      categories: ['breakfast', 'snack'],
      prepTime: 10,
      cookTime: 5,
      difficultyLevel: 'easy',
      createdAt: new Date().toISOString(),
      description: `A quick and nutritious breakfast or snack option. Creamy avocado on crispy toast with a hint of lemon and spice.`
    },
    {
      id: '1004',
      title: 'Chicken Stir Fry',
      ingredients: [
        { name: 'boneless chicken breast', amount: '500g, sliced', id: '1' },
        { name: 'bell peppers', amount: '2, sliced', id: '2' },
        { name: 'broccoli', amount: '1 cup, florets', id: '3' },
        { name: 'carrots', amount: '2, julienned', id: '4' },
        { name: 'garlic', amount: '3 cloves, minced', id: '5' },
        { name: 'ginger', amount: '1 tbsp, grated', id: '6' },
        { name: 'soy sauce', amount: '3 tbsp', id: '7' },
        { name: 'honey', amount: '1 tbsp', id: '8' },
        { name: 'sesame oil', amount: '2 tsp', id: '9' },
        { name: 'vegetable oil', amount: '2 tbsp', id: '10' },
        { name: 'sesame seeds', amount: '1 tsp', id: '11' }
      ],
      instructions: [
        "1. In a small bowl, mix soy sauce, honey, and sesame oil to make the sauce.",
        "2. Heat vegetable oil in a large wok or skillet over high heat.",
        "3. Add chicken and stir-fry until no longer pink, about 4-5 minutes.",
        "4. Add garlic and ginger, stir-fry for 30 seconds until fragrant.",
        "5. Add all vegetables and stir-fry for 3-4 minutes until crisp-tender.",
        "6. Pour sauce over the chicken and vegetables, toss to coat evenly.",
        "7. Cook for another 2 minutes until sauce thickens slightly.",
        "8. Sprinkle with sesame seeds and serve hot with rice."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      categories: ['dinner'],
      prepTime: 15,
      cookTime: 15,
      difficultyLevel: 'medium',
      createdAt: new Date().toISOString(),
      description: `A quick and flavorful Asian-inspired dinner. Tender chicken and crisp vegetables coated in a savory-sweet sauce.`
    },
    {
      id: '1005',
      title: 'Greek Salad',
      ingredients: [
        { name: 'cucumber', amount: '1, diced', id: '1' },
        { name: 'tomatoes', amount: '2, diced', id: '2' },
        { name: 'red onion', amount: '1/2, thinly sliced', id: '3' },
        { name: 'green bell pepper', amount: '1, diced', id: '4' },
        { name: 'kalamata olives', amount: '1/2 cup', id: '5' },
        { name: 'feta cheese', amount: '200g, cubed', id: '6' },
        { name: 'olive oil', amount: '1/4 cup', id: '7' },
        { name: 'lemon juice', amount: '2 tbsp', id: '8' },
        { name: 'dried oregano', amount: '1 tsp', id: '9' },
        { name: 'salt and pepper', amount: 'to taste', id: '10' }
      ],
      instructions: [
        "1. In a large bowl, combine cucumber, tomatoes, red onion, and bell pepper.",
        "2. Add kalamata olives and feta cheese cubes.",
        "3. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.",
        "4. Pour dressing over the salad and toss gently to combine.",
        "5. Let sit for at least 10 minutes before serving to allow flavors to meld.",
        "6. Serve chilled with a sprinkle of additional oregano if desired."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      categories: ['lunch', 'dinner'],
      prepTime: 20,
      cookTime: 0,
      difficultyLevel: 'easy',
      createdAt: new Date().toISOString(),
      description: `A refreshing Mediterranean salad with crisp vegetables, briny olives, and creamy feta cheese in a simple olive oil and lemon dressing.`
    },
    {
      id: '1006',
      title: 'Classic Cheeseburger',
      ingredients: [
        { name: 'ground beef', amount: '500g', id: '1' },
        { name: 'hamburger buns', amount: '4', id: '2' },
        { name: 'cheddar cheese', amount: '4 slices', id: '3' },
        { name: 'lettuce', amount: '4 leaves', id: '4' },
        { name: 'tomato', amount: '1, sliced', id: '5' },
        { name: 'red onion', amount: '1/2, sliced', id: '6' },
        { name: 'dill pickles', amount: '8 slices', id: '7' },
        { name: 'ketchup', amount: 'to taste', id: '8' },
        { name: 'mustard', amount: 'to taste', id: '9' },
        { name: 'salt and pepper', amount: 'to taste', id: '10' },
        { name: 'vegetable oil', amount: '1 tbsp', id: '11' }
      ],
      instructions: [
        "1. Divide the ground beef into 4 equal portions and shape into patties slightly larger than your buns.",
        "2. Make a slight depression in the center of each patty with your thumb to prevent bulging during cooking.",
        "3. Season both sides of patties generously with salt and pepper.",
        "4. Heat oil in a skillet over medium-high heat.",
        "5. Cook patties for 3-4 minutes on each side for medium doneness.",
        "6. Add a cheese slice to each patty during the last minute of cooking. Cover to melt.",
        "7. Lightly toast the hamburger buns in the same skillet.",
        "8. Assemble burgers: bottom bun, ketchup/mustard, lettuce, patty with cheese, tomato, onion, pickles, top bun.",
        "9. Serve immediately."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      categories: ['lunch', 'dinner'],
      prepTime: 15,
      cookTime: 10,
      difficultyLevel: 'medium',
      createdAt: new Date().toISOString(),
      description: `An all-American favorite - juicy beef patties topped with melted cheese and fresh vegetables on a toasted bun.`
    },
    {
      id: '1007',
      title: 'Guacamole',
      ingredients: [
        { name: 'ripe avocados', amount: '3', id: '1' },
        { name: 'lime', amount: '1, juiced', id: '2' },
        { name: 'red onion', amount: '1/4 cup, finely diced', id: '3' },
        { name: 'cilantro', amount: '3 tbsp, chopped', id: '4' },
        { name: 'jalapeño', amount: '1, seeded and minced', id: '5' },
        { name: 'garlic', amount: '1 clove, minced', id: '6' },
        { name: 'tomato', amount: '1, diced', id: '7' },
        { name: 'salt', amount: 'to taste', id: '8' },
        { name: 'pepper', amount: 'to taste', id: '9' },
        { name: 'cumin', amount: '1/4 tsp', id: '10' }
      ],
      instructions: [
        "1. Cut avocados in half, remove pits, and scoop flesh into a medium bowl.",
        "2. Mash avocados with a fork, leaving some chunks for texture.",
        "3. Add lime juice and mix to combine (this prevents browning).",
        "4. Stir in onion, cilantro, jalapeño, and garlic.",
        "5. Gently fold in diced tomatoes.",
        "6. Season with salt, pepper, and cumin to taste.",
        "7. Let sit at room temperature for 30 minutes to allow flavors to develop.",
        "8. Serve with tortilla chips or as a topping for Mexican dishes."
      ],
      imageUrl: 'https://images.unsplash.com/photo-1580998316183-7892407d7f74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      categories: ['snack', 'appetizer'],
      prepTime: 15,
      cookTime: 0,
      difficultyLevel: 'easy',
      createdAt: new Date().toISOString(),
      description: `Fresh, flavorful Mexican dip made with ripe avocados, lime, onions, and herbs. Perfect for parties or as a topping for tacos.`
    }];
  });
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // View recipe details
  const handleViewRecipe = (recipe) => {
    setViewingRecipe(recipe);
  };
  
  // Close recipe details
  const closeRecipeDetails = () => {
    setViewingRecipe(null);
  };
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
    
    // Close the detail view if we're deleting the recipe we're viewing
    if (viewingRecipe && viewingRecipe.id === id) {
      setViewingRecipe(null);
    }
    
    toast.success("Recipe deleted!");
  };
  
  // Confirm recipe deletion
  const confirmDeleteRecipe = (id, e) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      handleDeleteRecipe(id);
    }
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
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";
                  }}
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
                <button 
                  onClick={() => handleViewRecipe(recipe)} 
                  className="btn btn-outline text-sm">View Recipe</button>
                <button 
                  onClick={(e) => confirmDeleteRecipe(recipe.id, e)}
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
      
      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {viewingRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeRecipeDetails}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
                <img 
                  src={viewingRecipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";
                  }}
                  alt={viewingRecipe.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <button 
                  onClick={closeRecipeDetails}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white"
                  aria-label="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex gap-2 mb-2">
                    {viewingRecipe.categories.map(cat => (
                      <span key={cat} className="text-xs font-medium bg-primary/80 text-white px-2 py-1 rounded-full">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{viewingRecipe.title}</h2>
                </div>
              </div>
              
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
                    <ul className="space-y-2">
                      {viewingRecipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-baseline gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                          <span>{ing.name} {ing.amount && `- ${ing.amount}`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      {getIcon('ListOrdered')({ className: "h-5 w-5 text-primary" })}
                      <span>Instructions</span>
                    </h3>
                    <div className="space-y-4">
                      {viewingRecipe.instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="bg-primary text-white rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <p className="text-surface-700 dark:text-surface-300">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 flex justify-between">
                  <button onClick={closeRecipeDetails} className="btn btn-outline">
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      confirmDeleteRecipe(viewingRecipe.id);
                    }}
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete Recipe
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;