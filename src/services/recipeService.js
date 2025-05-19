// Helper function to get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Fetch user-specific recipes (recently viewed or shared)
export const fetchUserRecipes = async (options = {}) => {
  try {
    const client = getClient();
    const params = {
      fields: ['Id', 'Name', 'title', 'description', 'imageUrl', 'Owner', 'CreatedBy', 'ModifiedOn'],
      orderBy: options.orderBy || [{ field: 'ModifiedOn', direction: 'DESC' }],
      pagingInfo: {
        limit: options.limit || 10,
        offset: options.offset || 0
      }
    };
    
    if (options.where) params.where = options.where;
    
    const response = await client.fetchRecords('recipe', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return [];
  }
};

// Create a new recipe record
export const createRecipe = async (recipeData) => {
  try {
    const client = getClient();
    
    // Filter data to only include updateable fields
    const params = {
      records: [{
        Name: recipeData.title, // Name field is required
        title: recipeData.title,
        description: recipeData.description,
        imageUrl: recipeData.imageUrl,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficultyLevel: recipeData.difficultyLevel,
        categories: recipeData.categories.join(';') // Store multi-picklist as semicolon-separated string
      }]
    };
    const response = await client.createRecord('recipe', params);
    return response?.results?.[0]?.data || null;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

// Fetch all recipes with optional search and filter
export const fetchAllRecipes = async (searchTerm = '', category = 'all') => {
  try {
    const client = getClient();
    
    const params = {
      fields: ['Id', 'Name', 'title', 'description', 'imageUrl', 'prepTime', 'cookTime', 'servings', 'difficultyLevel', 'categories'],
      orderBy: [{ field: 'ModifiedOn', direction: 'DESC' }]
    };
    
    // Add search functionality
    if (searchTerm) {
      params.where = [
        {
          fieldName: 'title',
          operator: 'Contains',
          values: [searchTerm]
        }
      ];
    }
    
    // Add category filtering (if not 'all')
    if (category && category !== 'all') {
      params.where = params.where || [];
      params.where.push({
        fieldName: 'categories',
        operator: 'Contains',
        values: [category]
      });
    }
    
    const response = await client.fetchRecords('recipe', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

// Delete a recipe by ID
export const deleteRecipe = async (recipeId) => {
  try {
    const client = getClient();
    return await client.deleteRecord('recipe', { RecordIds: [recipeId] });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};