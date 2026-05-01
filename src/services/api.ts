/**
 * @file api.ts
 * @description Centralized Axios instance with global request/response interceptors.
 * Provides a reliable foundation for all outbound HTTP requests in MentrixOS.
 */
import axios from 'axios';

import { API_URL } from '../utils/api';

/**
 * The base URL for all API requests. Falls back to a predefined constant if no ENV var is present.
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || API_URL;

/**
 * Pre-configured Axios instance.
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Automatically injects the stored JWT (either pre_context_token or access_token)
 * into the Authorization header of every outbound request.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Catches global API errors. Specifically traps 401 Unauthorized errors to 
 * potentially flush the session and force a re-authentication flow.
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access globally (e.g., redirect to login)
            console.error('Unauthorized access - potentially redirecting to login.');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
