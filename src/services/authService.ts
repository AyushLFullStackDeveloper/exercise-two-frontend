import apiClient from './api';

export const authService = {
    login: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },
    getInstitutesAndRoles: async () => {
        const response = await apiClient.get('/auth/my-institutes-roles');
        return response.data;
    },
    selectContext: async (contextData: any) => {
        const response = await apiClient.post('/auth/select-context', contextData);
        return response.data;
    }
};
