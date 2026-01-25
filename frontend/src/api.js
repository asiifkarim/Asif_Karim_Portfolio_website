// API Service - Centralized API calls
const API_BASE_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:8000';

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add auth token if available
    const token = localStorage.getItem('admin_token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Call failed:', error);
        throw error;
    }
}

// API Methods
const API = {
    // Public endpoints
    getProjects: () => apiCall('/api/projects'),
    getBlogs: () => apiCall('/api/blogs'),
    getProfileImage: () => apiCall('/api/profile-image'),
    submitContact: (data) => apiCall('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // Auth endpoints
    login: (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return apiCall('/api/auth/login', {
            method: 'POST',
            body: formData,
        });
    },
    
    getCurrentUser: () => apiCall('/api/auth/me'),
    logout: () => apiCall('/api/auth/logout', { method: 'POST' }),
    
    // Admin endpoints (require auth)
    uploadImage: (formData) => apiCall('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
    }),
    getImages: () => apiCall('/api/admin/images'),
    deleteImage: (id) => apiCall(`/api/admin/images/${id}`, { method: 'DELETE' }),
    setProfileImage: (id) => apiCall(`/api/admin/images/${id}/set-profile`, { method: 'POST' }),
};

// Export for use
if (typeof window !== 'undefined') {
    window.API = API;
    window.apiCall = apiCall;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, apiCall };
}

