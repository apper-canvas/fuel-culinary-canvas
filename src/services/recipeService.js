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

    // Convert categories array to comma-separated string (Tag type format)
    let categories = recipeData.categories;
    if (Array.isArray(categories)) {
      categories = categories.join(',');
    }

    // Verify required fields are present
    if (!recipeData.title) {
      throw new Error('Recipe title is required');
    }

    // Prepare data according to the table schema
    const params = {
      records: [{
        Name: recipeData.title || 'Untitled Recipe', // Name field is required
        title: recipeData.title,
        description: recipeData.description,
        imageUrl: recipeData.imageUrl || null,
        prepTime: parseInt(recipeData.prepTime) || 0,
        cookTime: parseInt(recipeData.cookTime) || 0,
        servings: parseInt(recipeData.servings) || 1,
        difficultyLevel: recipeData.difficultyLevel,
        categories: categories // Store as comma-separated string per API requirements
      }]
    };

    console.log('Creating recipe with params:', JSON.stringify(params));
    const response = await client.createRecord('recipe', params);
    
    if (!response || !response.results || !response.results[0] || !response.results[0].data) {
      throw new Error(`Failed to create recipe: Invalid response from server: ${JSON.stringify(response)}`);
    }
    return response.results[0].data;
  } catch (error) {
    console.error('Error creating recipe:', error.message || error);
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