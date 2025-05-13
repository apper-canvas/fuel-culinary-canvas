import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  // Icon declarations
  const AlertCircleIcon = getIcon('AlertCircle');
  const ChevronLeftIcon = getIcon('ChevronLeft');
  const ChefHatIcon = getIcon('ChefHat');
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: [0, 10, 0, -10, 0],
            y: [0, -5, 0, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <ChefHatIcon className="h-24 w-24 text-primary/40" />
        </motion.div>
        <AlertCircleIcon className="h-12 w-12 text-primary absolute bottom-0 right-0" />
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-surface-800 dark:text-surface-100">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-surface-700 dark:text-surface-200">
        Page Not Found
      </h2>
      
      <p className="text-surface-600 dark:text-surface-300 max-w-md mb-8">
        We couldn't find the page you were looking for. Perhaps you were searching for a recipe that doesn't exist yet?
      </p>
      
      <Link to="/" className="btn btn-primary flex items-center gap-2">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>Back to Recipes</span>
      </Link>
    </motion.div>
  );
}

export default NotFound;