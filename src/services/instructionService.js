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
          fieldName: 'recipe',
          operator: 'ExactMatch',
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

    // Validate recipeId
    if (!recipeId) {
      throw new Error('Recipe ID is required to create instructions');
    }

    // Validate instructionsData
    if (!Array.isArray(instructionsData) || instructionsData.length === 0) {
      throw new Error('Instructions data must be a non-empty array');
    }

    // Map instructions to match the exact schema from the Tables & Fields JSON
    const params = {
      records: instructionsData.map((instruction, index) => ({
        Name: `Step ${index + 1}`,  // Required field
        Tags: '',  // Empty string for Tags field as it exists in the schema
        step: instruction.step || '',  // Using the step field from schema
        sequence: instruction.sequence || (index + 1),  // Using sequence from schema
        recipe: recipeId  // This is the master-detail relationship field
      }))
    };
    
    console.log('Creating instructions with params:', JSON.stringify(params));
    const response = await client.createRecord('instruction', params);

    // More thorough response validation
    if (!response) {
      throw new Error('No response received from server');
    }

    if (!response.success) {
      throw new Error(`Server rejected instructions creation: ${JSON.stringify(response)}`);
    }

    if (!response.results || !Array.isArray(response.results)) {
      throw new Error(`Invalid results structure: ${JSON.stringify(response)}`);
    }

    // Check for any failed instruction creations
    const failedInstructions = response.results.filter(result => !result || !result.success);
    if (failedInstructions.length > 0) {
      console.warn(`${failedInstructions.length} instructions failed to create:`, failedInstructions);
    }

    // Return all results so the caller can handle any partial failures
    return response.results;
  } catch (error) {
    console.error('Error creating instructions:', error.message || error);
    throw new Error(`Failed to create instructions: ${error.message}`);
  }
};