import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const CreateRecipeButton = ({ onClick }) => {
  // Icons
  const PlusIcon = getIcon('Plus');
  const ChefHatIcon = getIcon('ChefHat');
  
  // Animation variants
  const buttonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.button
      onClick={onClick}
      className="bg-primary hover:bg-primary-dark text-white py-4 px-8 rounded-xl flex items-center gap-3 shadow-lg"
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      <ChefHatIcon className="h-6 w-6" /> <span className="text-lg font-bold">Create New Recipe</span> <PlusIcon className="h-5 w-5" />
    </motion.button>
  );
};

export default CreateRecipeButton;