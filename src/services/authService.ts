/**
 * @file authService.ts
 * @description Encapsulates all authentication-related API endpoints.
 * Separates the MentrixOS two-step authentication logic (credentials -> context).
 */
import apiClient from './api';

/**
 * Service object containing all authentication methods.
 */
export const authService = {
    /**
     * Step 1: Submits credentials to obtain a pre-context token and user data.
     * @param {any} credentials - The user's email and password payload
     * @returns {Promise<any>} The response payload containing user data and pre_context_token
     */
    login: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },
    /**
     * Step 2a: Fetches all institutes and roles assigned to the authenticated user.
     * Requires a valid pre_context_token.
     * @returns {Promise<any>} List of institutes mapped with available roles
     */
    getInstitutesAndRoles: async () => {
        const response = await apiClient.get('/auth/my-institutes-roles');
        return response.data;
    },
    /**
     * Step 2b: Exchanges the pre_context_token + selected context for a fully scoped access_token.
     * @param {any} contextData - Payload containing tenant_id, institute_id, and role_id
     * @returns {Promise<any>} The response payload containing the final access_token
     */
    selectContext: async (contextData: any) => {
        const response = await apiClient.post('/auth/select-context', contextData);
        return response.data;
    }
};
