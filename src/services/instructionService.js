// Helper function to get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Create multiple instructions linked to a recipe
export const createInstructions = async (recipeId, instructionsData) => {
  try {
    const client = getClient();
    
    // Prepare array of instruction records
    // Add sequence numbers based on array order
    const recordsToCreate = instructionsData.map((instruction, index) => ({
      Name: `Step ${index + 1}`, // Name field is required
      step: instruction.step,
      sequence: index + 1, // Sequence starts at 1
      recipe: recipeId // Link to parent recipe
    }));
    
    // Create all instructions in a single request
    const params = {
      records: recordsToCreate
    };
    
    const response = await client.createRecord('instruction', params);
    return response?.results || [];
  } catch (error) {
    console.error('Error creating instructions:', error);
    throw error;
  }
};

// Fetch instructions for a specific recipe
export const fetchInstructionsByRecipeId = async (recipeId) => {
  try {
    const client = getClient();
    
    const params = {
      fields: ["Id", "Name", "step", "sequence", "recipe"],
      where: [
        {
          fieldName: "recipe",
          operator: "ExactMatch",
          values: [recipeId]
        }
      ],
      orderBy: [
        { field: "sequence", direction: "ASC" }
      ]
    };
    
    const response = await client.fetchRecords('instruction', params);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching instructions:', error);
    throw error;
  }
};