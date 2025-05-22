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
    
    // Validate required fields
    if (!recipeData.title) {
      throw new Error('Recipe title is required');
    }

    // Convert categories array to comma-separated string for Tag field type
    const categories = Array.isArray(recipeData.categories) 
      ? recipeData.categories.join(',') 
      : recipeData.categories || '';

    // The 'Name' field is required by Apper for all tables
    // We'll use the title as the Name field value for better display
    const params = {
      records: [{
        // Required standard fields
        Name: recipeData.title || 'Untitled Recipe',  // Required
        Tags: categories,   // For categories - this matches the schema field name
        
        // Recipe-specific fields
        title: recipeData.title || '',
        description: recipeData.description || '',
        imageUrl: recipeData.imageUrl || '',
        prepTime: parseInt(recipeData.prepTime) || 0,
        cookTime: parseInt(recipeData.cookTime) || 0,
        servings: parseInt(recipeData.servings) || 1,
        difficultyLevel: recipeData.difficultyLevel || 'medium'
      }]
    };

    // Ensure safe logging by removing circular references
    try {
      const safeParams = JSON.parse(JSON.stringify(params));
      console.log('Creating recipe with params:', safeParams);
    } catch (e) {
      console.log('Creating recipe (params too complex to stringify)');
    }
    const response = await client.createRecord('recipe', params);
    
    // More thorough response validation
    if (!response || !response.success) {
      throw new Error(`Server rejected recipe creation: ${response ? 'Unsuccessful response' : 'No response'}`);
    
    if (!response.results || !response.results[0] || !response.results[0].success || !response.results[0].data) {
      throw new Error(`Failed to create recipe: Invalid result structure: ${JSON.stringify(response.results)}`);
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error('Error creating recipe:', error.message || error);
    
    // Safe error logging
    try {
      const errorDetails = {};
      if (error) Object.getOwnPropertyNames(error).forEach(key => errorDetails[key] = error[key]);
      console.error('Detailed error:', JSON.stringify(errorDetails));
    } catch (e) {}
    throw new Error(`Recipe creation failed: ${error.message || 'Unknown error'}`);
  }
};

// Fetch all recipes with optional search and filter
export const fetchAllRecipes = async (searchTerm = '', category = 'all') => {
  try {
    const client = getClient();
    
    const params = {
      fields: ['Id', 'Name', 'description', 'imageUrl', 'prepTime', 'cookTime', 'servings', 'difficultyLevel', 'categories'],
      orderBy: [{ field: 'ModifiedOn', direction: 'DESC' }]
    };
    
    // Add search functionality
    if (searchTerm) {
      params.where = [
        {
          fieldName: 'Name',
          operator: 'Contains',
          Values: [searchTerm]
        }
      ];
    }
    
    // Add category filtering (if not 'all')
    if (category && category !== 'all') {
      params.where = params.where || [];
      params.where.push({
        fieldName: 'categories',
        operator: 'Contains',
        Values: [category]
      });
    }
    
    const response = await client.fetchRecords('recipe', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching recipes:', error.message || error);
    
    // Log the error details in a format that won't trigger additional SDK errors
    try {
      const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
      console.error('Error details:', errorDetails);
    } catch (e) {
      // If we can't stringify the error, just log it as is
      console.error('Additional error details unavailable');
    }
    return []; // Return empty array instead of throwing to prevent UI crashes
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