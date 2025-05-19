// Helper function to get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Create multiple ingredients linked to a recipe
export const createIngredients = async (recipeId, ingredientsData) => {
  try {
    const client = getClient();
    
    // Prepare array of ingredient records
    const recordsToCreate = ingredientsData.map(ingredient => ({
      Name: ingredient.name, // Name field is required
      amount: ingredient.amount,
      recipe: recipeId // Link to parent recipe
    }));
    
    // Create all ingredients in a single request
    const params = {
      records: recordsToCreate
    };
    
    const response = await client.createRecord('ingredient', params);
    return response?.results || [];
  } catch (error) {
    console.error('Error creating ingredients:', error);
    throw error;
  }
};