// Helper function to get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Fetch instructions by recipe ID
export const fetchInstructionsByRecipeId = async (recipeId) => {
  try {
    const client = getClient();
    
    const params = {
      fields: ['Id', 'Name', 'step', 'sequence', 'recipe'],
      where: [
        {
          FieldName: 'recipe',
          Operator: 'ExactMatch',
          Values: [recipeId.toString()]
        }
      ],
      orderBy: [
        { field: 'sequence', direction: 'ASC' }
      ]
    };
    
    const response = await client.fetchRecords('instruction', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching instructions for recipe:', error);
    return [];
  }
};

// Create instructions for a recipe
export const createInstructions = async (recipeId, instructionsData) => {
  try {
    const client = getClient();
    
    // Prepare records for creation with the recipe relationship
    const params = {
      records: instructionsData.map((instruction, index) => ({
        Name: `Step ${index + 1}`,
        step: instruction.step,
        sequence: instruction.sequence || index + 1,
        recipe: recipeId
      }))
    };
    
    const response = await client.createRecord('instruction', params);
    
    if (response && response.success && response.results) {
      // Return successful creations
      return response.results;
    } else {
      console.error('Error creating instructions:', response);
      return [];
    }
  } catch (error) {
    console.error('Error creating instructions:', error);
    throw new Error(`Failed to create instructions: ${error.message}`);
  }
};