/**
 * API Configuration for Portfolio Frontend
 * Update BASE_URL to point to your deployed backend API
 */

const CONFIG = {
    // Backend API URL - Update this for production
    BASE_URL: 'http://localhost:8000',
    
    // API endpoints
    ENDPOINTS: {
        PROJECTS: '/api/projects',
        BLOGS: '/api/blogs',
        PROFILE_IMAGE: '/api/profile-image',
        CONTACT: '/api/contact'
    }
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
function getApiUrl(endpoint) {
    return CONFIG.BASE_URL + endpoint;
}

/**
 * Make API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} API response
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(getApiUrl(endpoint), {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl, apiRequest };
}