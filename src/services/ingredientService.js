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
    const recordsToCreate = ingredientsData.map((ingredient) => ({
      // Always provide a Name field for the record (required)
      Name: ingredient.name, // Name field is required
      // Ensure amount is a string
      amount: ingredient.amount,
      // Properly format the relationship to the recipe
      recipe: recipeId
    }));
    
    // Create all ingredients in a single request
    const params = {
      records: recordsToCreate
    };
    
    // If there are no ingredients to create, return empty results
    if (recordsToCreate.length === 0) {
      return [];
    }
    
    const response = await client.createRecord('ingredient', params);
    
    // Enhanced error checking and logging
    if (!response) {
      throw new Error('Failed to create ingredients: No response received from server');
    }
    if (!response.results) {
      throw new Error(`Failed to create ingredients: Invalid response structure - ${JSON.stringify(response)}`);
    }
    
    return response.results;
  } catch (error) {
    throw error;
  }
};

// Fetch ingredients for a specific recipe by recipeId
export const fetchIngredientsByRecipeId = async (recipeId) => {
  try {
    const client = getClient();
    
    // Set up params to filter ingredients by recipe ID
    const params = {
      fields: ['Id', 'Name', 'amount', 'recipe'],
      where: [
        {
          fieldName: 'recipe',
          operator: 'ExactMatch',
          values: [recipeId]
        }
      ],
      orderBy: [
        {
          field: 'Name',
          direction: 'asc'
        }
      ]
    };
    
    const response = await client.fetchRecords('ingredient', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching ingredients by recipe ID:', error);
    throw error;
  }
};