import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import CreateRecipeButton from '../components/CreateRecipeButton';
import { fetchAllRecipes } from '../services/recipeService';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const Home = ({ recipeFormRef }) => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Icons
  const CookingPotIcon = getIcon('UtensilsCrossed');

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Error loading recipes:', error);
        toast.error('Failed to load recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecipes();
  }, []);

  const openRecipeForm = () => {
    if (recipeFormRef.current) {
      recipeFormRef.current.openForm();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CookingPotIcon className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Begin Your Culinary Journey</h2>
          <CreateRecipeButton onClick={openRecipeForm} />
        </motion.div>
      </div>
      <MainFeature ref={recipeFormRef} onAddRecipe={(newRecipe) => setRecipes([newRecipe, ...recipes])} />
    </div>
  );
};

export default Home;