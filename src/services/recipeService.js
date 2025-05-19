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