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
    
    // Map ingredients to include the recipe ID
    const records = ingredientsData.map(ingredient => ({
      Name: ingredient.name,
      amount: ingredient.amount,
      recipe: recipeId
    }));
    
    // Create all ingredients in a batch
    const response = await client.createRecord('ingredient', {
      records: records
    });
    
    return response?.results || [];
  } catch (error) {
    console.error('Error creating ingredients:', error);
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