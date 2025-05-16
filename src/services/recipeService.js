/**
 * Recipe Service for managing recipe data with Apper backend
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
 * Fetch all recipes with filtering options
 */
export const fetchAllRecipes = async (searchTerm = '', category = 'all') => {
  try {
    const apperClient = getApperClient();
    const tableName = 'recipe';
    
    // Define fields we want to retrieve
    const fields = [
      'Id', 'title', 'description', 'imageUrl', 'prepTime', 
      'cookTime', 'servings', 'difficultyLevel', 'categories',
      'CreatedOn', 'Owner'
    ];
    
    // Build the query parameters
    const params = {
      Fields: fields,
      orderBy: [
        {
          field: 'CreatedOn',
          direction: 'DESC'
        }
      ],
      where: [
        {
          fieldName: 'IsDeleted',
          Operator: 'ExactMatch',
          values: [false]
        }
      ],
      pagingInfo: {
        limit: 100, // Adjust as needed
        offset: 0
      }
    };
    
    // Add search filter if provided
    if (searchTerm) {
      params.whereGroups = [{
        operator: 'OR',
        subGroups: [
          {
            conditions: [
              {
                FieldName: 'title',
                operator: 'Contains',
                values: [searchTerm]
              }
            ],
            operator: ''
          },
          {
            conditions: [
              {
                FieldName: 'description',
                operator: 'Contains',
                values: [searchTerm]
              }
            ],
            operator: ''
          }
        ]
      }];
    }
    
    // Add category filter if not 'all'
    if (category !== 'all') {
      params.where.push({
        fieldName: 'categories',
        Operator: 'Contains',
        values: [category]
      });
    }
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

/**
 * Create a new recipe
 */
export const createRecipe = async (recipeData) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'recipe';
    
    // Format the data according to the table schema
    const formattedData = {
      records: [{
        title: recipeData.title,
        description: recipeData.description,
        imageUrl: recipeData.imageUrl,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficultyLevel: recipeData.difficultyLevel,
        categories: recipeData.categories.join(','), // Convert array to comma-separated string
        IsDeleted: false
      }]
    };
    
    const response = await apperClient.createRecord(tableName, formattedData);
    
    if (!response || !response.success) {
      throw new Error('Failed to create recipe');
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
};

/**
 * Delete a recipe by ID
 */
export const deleteRecipe = async (recipeId) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'recipe';
    
    const params = {
      RecordIds: [recipeId]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    return response.success;
  } catch (error) {
    console.error(`Error deleting recipe with ID ${recipeId}:`, error);
    throw error;
  }
};