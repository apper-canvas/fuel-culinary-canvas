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
          Values: [recipeId]
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