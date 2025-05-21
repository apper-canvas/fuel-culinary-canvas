// Helper function to get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Create ingredients linked to a recipe
export const createIngredients = async (recipeId, ingredientsData) => {
  try {
    const client = getClient();
    
    // Validate recipeId
    if (!recipeId) {
      throw new Error('Recipe ID is required to create ingredients');
    }
    
    // Map ingredients to match the exact schema from the Tables & Fields JSON
    const records = ingredientsData.map(ingredient => ({
      Name: ingredient.name || `Ingredient ${Date.now()}`,  // Required field
      Tags: '',  // Empty string for Tags field as it exists in the schema
      amount: ingredient.amount || '',  // Using the amount field from schema
      recipe: recipeId  // This is the master-detail relationship field
    }));

    // Create all ingredients in a batch
    const response = await client.createRecord('ingredient', {
      records: records
    });
    
    return response?.results || [];
  } catch (error) {
    // More detailed error logging
    console.error('Error creating ingredients:', error.message || error);
    
    // Log the error details in a format that won't trigger additional errors
    try {
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (e) {}
    
    throw error;
  }
};

// Fetch ingredients by recipe ID
export const fetchIngredientsByRecipeId = async (recipeId) => {
  try {
    const client = getClient();
    
    const params = {
      fields: ['Id', 'Name', 'amount', 'recipe'],
      where: [
        {
          FieldName: 'recipe',
          Operator: 'ExactMatch',
          Values: [recipeId.toString()]
        }
      ]
    };
    
    const response = await client.fetchRecords('ingredient', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching ingredients for recipe:', error);
    return [];
  }
};