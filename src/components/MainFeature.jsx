import { useState, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { createRecipe } from '../services/recipeService';
import { createIngredients } from '../services/ingredientService';
import { createInstructions } from '../services/instructionService';
import getIcon from '../utils/iconUtils';

const MainFeature = forwardRef(function MainFeature({ onAddRecipe }, ref) {
  // Icon declarations
  const PlusIcon = getIcon('Plus');
  const XIcon = getIcon('X');
  const BookOpenIcon = getIcon('BookOpen');
  const EggIcon = getIcon('Egg');
  const TimerIcon = getIcon('Timer');
  const ChefHatIcon = getIcon('ChefHat');
  const ListOrderedIcon = getIcon('ListOrdered');
  const ImageIcon = getIcon('Image');
  const TagIcon = getIcon('Tag');
  const TrashIcon = getIcon('Trash');
  const SaveIcon = getIcon('Save');
  const RefreshCcwIcon = getIcon('RefreshCcw');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficultyLevel: 'medium',
    ingredients: [{ id: Date.now(), name: '', quantity: '', unit: '' }],
    instructions: [{ id: Date.now(), step: '' }],
    categories: []
  });
  
  // Available categories
  const availableCategories = [
    'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegetarian', 'vegan', 'gluten-free'
  ];
  
  // Form validation state
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openForm: () => {
      setIsFormOpen(true);
    }
  }));
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field if it exists
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };
  
  // Handle ingredient changes
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: updatedIngredients });
  };
  
  // Add new ingredient field
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { id: Date.now(), name: '', quantity: '', unit: '' }]
    });
  };
  
  // Remove ingredient field
  const removeIngredient = (index) => {
    if (formData.ingredients.length === 1) {
      toast.info("You need at least one ingredient");
      return;
    }
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };
  
  // Handle instruction changes
  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = { ...updatedInstructions[index], step: value };
    setFormData({ ...formData, instructions: updatedInstructions });
  };
  
  // Add new instruction field
  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, { id: Date.now(), step: '' }]
    });
  };
  
  // Remove instruction field
  const removeInstruction = (index) => {
    if (formData.instructions.length === 1) {
      toast.info("You need at least one instruction");
      return;
    }
    const updatedInstructions = [...formData.instructions];
    updatedInstructions.splice(index, 1);
    setFormData({ ...formData, instructions: updatedInstructions });
  };
  
  // Handle category selection
  const toggleCategory = (category) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(cat => cat !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.prepTime <= 0) newErrors.prepTime = "Prep time must be greater than 0";
    if (formData.cookTime <= 0) newErrors.cookTime = "Cook time must be greater than 0";
    if (formData.servings <= 0) newErrors.servings = "Servings must be greater than 0";
    
    // Validate ingredients
    const invalidIngredients = formData.ingredients.some(ing => !ing.name.trim() || !ing.quantity.trim());
    if (invalidIngredients) newErrors.ingredients = "All ingredients must have a name and quantity";
    
    // Validate instructions
    const invalidInstructions = formData.instructions.some(inst => !inst.step.trim());
    if (invalidInstructions) newErrors.instructions = "All instructions must be filled out";
    
    // Validate categories
    if (formData.categories.length === 0) newErrors.categories = "Select at least one category";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Step 1: Create the recipe record
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        imageUrl: formData.imageUrl || '',
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings),
        difficultyLevel: formData.difficultyLevel,
        // Categories will be converted to Tags in the service
        categories: formData.categories
      };
      
      const recipeResponse = await createRecipe(recipeData);
      
      if (!recipeResponse || !recipeResponse.Id) {
        throw new Error('Failed to create recipe: Invalid recipe ID returned');
      }
      
      // Use the recipe ID for child records
      const recipeId = recipeResponse.Id;
      
      console.log(`Recipe created successfully with ID: ${recipeId}`);

      // Step 2: Create ingredients linked to the recipe
      const ingredientsData = formData.ingredients.map(ing => ({
        // Ensure all fields are properly defined
        name: ing.name.trim(),
        // Format quantity and unit into a single amount string
        amount: `${ing.quantity} ${ing.unit}`.trim()
      }));
      
      const ingredientsResponse = await createIngredients(recipeId, ingredientsData);

      // Safely check and log ingredient creation results
      if (Array.isArray(ingredientsResponse)) {
        console.log(`Created ${ingredientsResponse.length} ingredients for recipe ${recipeId}`);
        // Check if any ingredients failed to create
        const failedIngredients = ingredientsResponse.filter(result => !result.success);
        if (failedIngredients.length > 0) {
          console.warn(`${failedIngredients.length} ingredients failed to create`);
        }
      }

      // Step 3: Create instructions linked to the recipe
      const instructionsData = formData.instructions.map((inst) => ({
        // Ensure step is a string
        step: inst.step ? inst.step.trim() : '',
        // Will be overridden in the next loop, but provide a default
        sequence: 0
      }));
      
      // Sort instructionsData by their index in the array
      // and assign sequence numbers
      instructionsData.forEach((inst, index) => { inst.sequence = index + 1; });
      
      const instructionsResponse = await createInstructions(recipeId, instructionsData);

      // Safely check and log instruction creation results
      if (Array.isArray(instructionsResponse)) {
        console.log(`Created ${instructionsResponse.length} instructions for recipe ${recipeId}`);
        // Check if any instructions failed to create
        const failedInstructions = instructionsResponse.filter(result => !result || !result.success);
        if (failedInstructions.length > 0) {
          console.warn(`${failedInstructions.length} instructions failed to create`);
        }
      }
      else {
        console.warn('Unexpected response format from createInstructions:', 
          typeof instructionsResponse, instructionsResponse);
      }
      
      // Notify parent component with new recipe if callback exists
      if (onAddRecipe) {
        onAddRecipe(recipeResponse);
      }
      
      resetForm();
      setIsFormOpen(false);

      toast.success("Recipe added successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      
      // Extract the error message or use a generic one
      let errorMsg = 'Unknown error occurred';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error.toString && error.toString() !== '[object Object]') {
        errorMsg = error.toString();
      }
      
      // Check for specific error conditions based on the error message
      if (errorMsg.includes('Invalid response') || errorMsg.includes('Invalid result structure')) {
        toast.error(`Server returned an unexpected response. Please try again.`);
      }
      else if (errorMsg.includes('Recipe ID is required')) {
        toast.error(`Internal error: Recipe ID missing for related items. Please try again.`);
      }
      else if (errorMsg.includes('Server rejected')) {
        toast.error(`The server rejected your request. Please check your recipe details.`);
      }
      else {
        toast.error(`Failed to save recipe: ${errorMsg}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      difficultyLevel: 'medium',
      ingredients: [{ id: Date.now(), name: '', quantity: '', unit: '' }],
      instructions: [{ id: Date.now(), step: '' }],
      categories: []
    });
    setErrors({});
  };
  
  // Form animation variants
  const formVariants = {
    closed: { height: 0, opacity: 0 },
    open: { height: "auto", opacity: 1 }
  };
  
  return (
    <section id="features" className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className={`btn fixed bottom-6 right-6 z-10 rounded-full p-4 shadow-lg
          ${isFormOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isFormOpen ? <XIcon className="h-6 w-6 text-white" /> : <PlusIcon className="h-6 w-6 text-white" />}
      </motion.button>
      
      {/* Form Container */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={formVariants}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="card overflow-hidden my-8"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-primary" />
                  <span>Create New Recipe</span>
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 text-surface-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <RefreshCcwIcon className="h-4 w-4" />
                  <span className="text-sm">Reset</span>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Recipe Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="E.g. Homemade Chocolate Chip Cookies"
                      className={`input-field ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your recipe in a few sentences..."
                      rows="3"
                      className={`input-field resize-none ${errors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Image URL (Optional)
                    </label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input
                          type="text"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                    <p className="text-surface-500 dark:text-surface-400 text-xs mt-1">
                      Paste a URL to an image of your recipe
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Difficulty Level
                    </label>
                    <select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                {/* Cooking Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Prep Time (mins)*
                    </label>
                    <div className="relative">
                      <TimerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                      <input
                        type="number"
                        name="prepTime"
                        value={formData.prepTime}
                        onChange={handleChange}
                        min="0"
                        className={`input-field pl-10 ${errors.prepTime ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.prepTime && <p className="text-red-500 text-sm mt-1">{errors.prepTime}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Cook Time (mins)*
                    </label>
                    <div className="relative">
                      <TimerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                      <input
                        type="number"
                        name="cookTime"
                        value={formData.cookTime}
                        onChange={handleChange}
                        min="0"
                        className={`input-field pl-10 ${errors.cookTime ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.cookTime && <p className="text-red-500 text-sm mt-1">{errors.cookTime}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                      Servings*
                    </label>
                    <div className="relative">
                      <ChefHatIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                      <input
                        type="number"
                        name="servings"
                        value={formData.servings}
                        onChange={handleChange}
                        min="1"
                        className={`input-field pl-10 ${errors.servings ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.servings && <p className="text-red-500 text-sm mt-1">{errors.servings}</p>}
                  </div>
                </div>
                
                {/* Categories */}
                <div>
                  <label className="block text-surface-700 dark:text-surface-300 mb-2 font-medium">
                    Categories*
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1
                          ${formData.categories.includes(category) 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'}`}
                      >
                        <TagIcon className="h-3.5 w-3.5" />
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                  {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
                </div>
                
                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-surface-700 dark:text-surface-300 font-medium">
                      Ingredients*
                    </label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Ingredient</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={ingredient.id} className="flex items-center gap-2">
                        <div className="w-1/2">
                          <div className="relative">
                            <EggIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                              placeholder="Ingredient name"
                              className="input-field pl-10 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                        <div className="w-1/6">
                          <input
                            type="text"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="input-field py-1.5 text-sm"
                          />
                        </div>
                        <div className="w-1/6">
                          <input
                            type="text"
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            placeholder="Unit"
                            className="input-field py-1.5 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-1.5 text-surface-500 hover:text-red-500 transition-colors"
                          aria-label="Remove ingredient"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>}
                </div>
                
                {/* Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-surface-700 dark:text-surface-300 font-medium">
                      Instructions*
                    </label>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Step</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.instructions.map((instruction, index) => (
                      <div key={instruction.id} className="flex items-center gap-2">
                        <div className="relative flex-grow">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={instruction.step}
                            onChange={(e) => handleInstructionChange(index, e.target.value)}
                            placeholder={`Step ${index + 1} instruction`}
                            className="input-field pl-10 py-1.5 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="p-1.5 text-surface-500 hover:text-red-500 transition-colors"
                          aria-label="Remove step"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions}</p>}
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><SaveIcon className="h-5 w-5" /><span>Save Recipe</span></>}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default MainFeature;