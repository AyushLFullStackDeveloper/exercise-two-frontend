import axios from 'axios';

import { API_URL } from '../utils/api';

// Default API URL fallback if not set in environment
export const API_BASE_URL = process.env.REACT_APP_API_URL || API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add auth token
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

// Response Interceptor for global error handling
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
