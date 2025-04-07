import apiClient from './apiClient';

const analyticsApi = {
    getOverview: async () => {
        const response = await apiClient.get('/analytics/overview');
        return response.data;
    },

    getDailyOrders: async (startDate, endDate) => {
        const response = await apiClient.get('/analytics/daily-orders', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getStatusDistribution: async () => {
        const response = await apiClient.get('/analytics/status-distribution');
        return response.data;
    },

    getRevenue: async (startDate, endDate) => {
        const response = await apiClient.get('/analytics/revenue', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getTopProducts: async (limit = 10) => {
        const response = await apiClient.get('/analytics/top-products', {
            params: { limit }
        });
        return response.data;
    },

    getCustomerStats: async () => {
        const response = await apiClient.get('/analytics/customer-stats');
        return response.data;
    }
};

export default analyticsApi;