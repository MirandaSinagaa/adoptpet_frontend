import axios from 'axios';

const api = axios.create({
    // URL Backend Laravel
    baseURL: 'http://127.0.0.1:8000/api',
    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    
    // Penting untuk Sanctum
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;