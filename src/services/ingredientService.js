/**
 * Ingredient Service for managing ingredient data with Apper backend
 */

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch ingredients for a specific recipe
 */
export const fetchIngredientsByRecipeId = async (recipeId) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'ingredient';
    
    // Define fields we want to retrieve
    const fields = ['Id', 'Name', 'amount', 'recipe'];
    
    // Build the query parameters
    const params = {
      Fields: fields,
      where: [
        {
          fieldName: 'IsDeleted',
          Operator: 'ExactMatch',
          values: [false]
        },
        {
          fieldName: 'recipe',
          Operator: 'ExactMatch',
          values: [recipeId]
        }
      ],
      orderBy: [
        {
          field: 'Id',
          direction: 'ASC'
        }
      ],
      pagingInfo: {
        limit: 100, // Adjust as needed
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ingredients for recipe ${recipeId}:`, error);
    throw error;
  }
};

/**
 * Create ingredients for a recipe
 */
export const createIngredients = async (recipeId, ingredients) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'ingredient';
    
    // Format ingredients for bulk creation
    const formattedIngredients = {
      records: ingredients.map(ing => ({
        Name: ing.name,
        amount: ing.amount,
        recipe: recipeId,
        IsDeleted: false
      }))
    };
    
    const response = await apperClient.createRecord(tableName, formattedIngredients);
    
    if (!response || !response.success) {
      throw new Error('Failed to create ingredients');
    }
    
    return response.results.map(result => result.data);
  } catch (error) {
    console.error("Error creating ingredients:", error);
    throw error;
  }
};

/**
 * Delete all ingredients for a recipe
 */
export const deleteIngredientsByRecipeId = async (recipeId) => {
  try {
    const apperClient = getApperClient();
    
    // First fetch all ingredients for this recipe
    const ingredients = await fetchIngredientsByRecipeId(recipeId);
    
    if (ingredients.length === 0) {
      return true; // No ingredients to delete
    }
    
    const ingredientIds = ingredients.map(ing => ing.Id);
    const params = {
      RecordIds: ingredientIds
    };
    
    const response = await apperClient.deleteRecord('ingredient', params);
    return response.success;
  } catch (error) {
    console.error(`Error deleting ingredients for recipe ${recipeId}:`, error);
    throw error;
  }
};