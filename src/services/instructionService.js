/**
 * Instruction Service for managing instruction data with Apper backend
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
 * Fetch instructions for a specific recipe
 */
export const fetchInstructionsByRecipeId = async (recipeId) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'instruction';
    
    // Define fields we want to retrieve
    const fields = ['Id', 'Name', 'step', 'sequence', 'recipe'];
    
    // Build the query parameters
    const params = {
      Fields: fields,
      where: [
        {
          fieldName: 'IsDeleted',
          Operator: 'ExactMatch',
          values: [false]
        },
        {
          fieldName: 'recipe',
          Operator: 'ExactMatch',
          values: [recipeId]
        }
      ],
      orderBy: [
        {
          field: 'sequence',
          direction: 'ASC'
        }
      ],
      pagingInfo: {
        limit: 100, // Adjust as needed
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching instructions for recipe ${recipeId}:`, error);
    throw error;
  }
};

/**
 * Create instructions for a recipe
 */
export const createInstructions = async (recipeId, instructions) => {
  try {
    const apperClient = getApperClient();
    const tableName = 'instruction';
    
    // Format instructions for bulk creation
    const formattedInstructions = {
      records: instructions.map((inst, index) => ({
        Name: `Step ${index + 1}`,
        step: inst.step,
        sequence: index + 1,
        recipe: recipeId,
        IsDeleted: false
      }))
    };
    
    const response = await apperClient.createRecord(tableName, formattedInstructions);
    
    if (!response || !response.success) {
      throw new Error('Failed to create instructions');
    }
    
    return response.results.map(result => result.data);
  } catch (error) {
    console.error("Error creating instructions:", error);
    throw error;
  }
};

/**
 * Delete all instructions for a recipe
 */
export const deleteInstructionsByRecipeId = async (recipeId) => {
  try {
    const apperClient = getApperClient();
    
    // First fetch all instructions for this recipe
    const instructions = await fetchInstructionsByRecipeId(recipeId);
    
    if (instructions.length === 0) {
      return true; // No instructions to delete
    }
    
    const instructionIds = instructions.map(inst => inst.Id);
    const params = {
      RecordIds: instructionIds
    };
    
    const response = await apperClient.deleteRecord('instruction', params);
    return response.success;
  } catch (error) {
    console.error(`Error deleting instructions for recipe ${recipeId}:`, error);
    throw error;
  }
};