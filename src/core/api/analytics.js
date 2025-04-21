import apiClient from './apiClient';

const analyticsApi = {
    getOverview: async () => {
        try {
            const response = await apiClient.get('/analytics/overview');
            console.log('Overview response:', response);
            return response;
        } catch (error) {
            console.error('獲取概覽數據失敗:', error);
            throw error;
        }
    },

    getSales: async (start, end) => {
        try {
            const response = await apiClient.get('/analytics/sales', {
                params: { start, end }
            });
            console.log('Sales response:', response);
            return response;
        } catch (error) {
            console.error('獲取銷售數據失敗:', error);
            throw error;
        }
    },

    getStatusDistribution: async () => {
        try {
            const response = await apiClient.get('/analytics/status');
            console.log('Status distribution response:', response);
            return response;
        } catch (error) {
            console.error('獲取狀態分佈失敗:', error);
            throw error;
        }
    },

    getTopProducts: async (limit = 10) => {
        try {
            const response = await apiClient.get('/analytics/top-products', {
                params: { limit }
            });
            console.log('Top products response:', response);
            return response;
        } catch (error) {
            console.error('獲取熱門商品失敗:', error);
            throw error;
        }
    }
};

export default analyticsApi;