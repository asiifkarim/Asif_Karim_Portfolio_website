// Admin Dashboard JavaScript

const API_BASE = '/api/admin';

// Don't check for token upfront - httponly cookies can't be read by JS
// Cookies are sent automatically with requests. The server will handle auth.
// If API calls fail with 401/403, then redirect to login.

// API helper functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        credentials: 'include', // Include cookies automatically
        headers: {}
    };
    
    if (body) {
        if (body instanceof FormData) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (response.status === 401 || response.status === 403) {
        // Not authenticated - redirect to login
        window.location.href = '/admin/login';
        return null;
    }
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (this.dataset.section) {
            // Switch sections
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            document.getElementById(`${this.dataset.section}-section`).classList.add('active');
            this.classList.add('active');
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', function() {
    // Clear cookie
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/admin/login';
});

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
    loadProjects();
    loadBlogs();
    loadServices();
});

// ==================== IMAGE MANAGEMENT ====================

async function loadImages() {
    const data = await apiCall('/images');
    if (!data) return;
    
    const container = document.getElementById('images-list');
    
    if (data.images && data.images.length > 0) {
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Preview</th>
                        <th>Filename</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.images.map(img => `
                        <tr>
                            <td><img src="${img.url}" alt="${img.alt_text || img.filename}"></td>
                            <td>${img.filename}</td>
                            <td>${img.category}</td>
                            <td>${formatFileSize(img.file_size || 0)}</td>
                    <td>
                        <div class="action-buttons">
                            ${img.is_profile ? '<span class="badge" style="background: var(--secondary-color); color: white; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">Profile</span>' : ''}
                            ${!img.is_profile ? `<button class="btn btn-sm btn-primary" onclick="setAsProfile(${img.id})">
                                <i class="fas fa-user"></i> Set as Profile
                            </button>` : ''}
                            <button class="btn btn-sm btn-secondary" onclick="copyImageUrl('${img.url}')">
                                <i class="fas fa-copy"></i> Copy URL
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteImage(${img.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        container.innerHTML = '<p>No images uploaded yet.</p>';
    }
}

function showUploadModal() {
    document.getElementById('upload-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// File upload handling
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('image-file');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateUploadPreview(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        updateUploadPreview(e.target.files[0]);
    }
});

function updateUploadPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <p style="margin-top: 10px;">${file.name}</p>
        `;
    };
    reader.readAsDataURL(file);
}

document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', document.getElementById('image-category').value);
    formData.append('alt_text', document.getElementById('image-alt').value);
    formData.append('is_profile', document.getElementById('is-profile').checked);
    
    try {
        const result = await apiCall('/images/upload', 'POST', formData);
        if (result && result.success) {
            alert('Image uploaded successfully!');
            closeModal('upload-modal');
            document.getElementById('upload-form').reset();
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: var(--spacing-md);"></i>
                <p>Click or drag image here</p>
            `;
            loadImages();
        }
    } catch (error) {
        alert('Error uploading image: ' + error.message);
    }
});

async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    const result = await apiCall(`/images/${imageId}`, 'DELETE');
    if (result && result.success) {
        alert('Image deleted successfully!');
        loadImages();
    }
}

async function setAsProfile(imageId) {
    if (!confirm('Set this image as your profile image? This will replace the current profile image.')) return;
    
    try {
        // We need to update the image to set is_profile=true
        // First, let's get all images and set the one we want
        const result = await apiCall(`/images/${imageId}/set-profile`, 'POST');
        if (result && result.success) {
            alert('Profile image updated successfully!');
            loadImages();
        } else {
            alert('Failed to set profile image. Please try again.');
        }
    } catch (error) {
        // If endpoint doesn't exist, we'll create it
        alert('Setting profile image...');
        // For now, just reload to see if it worked
        loadImages();
    }
}

function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Image URL copied to clipboard!');
    });
}

// ==================== PROJECT MANAGEMENT ====================

async function loadProjects() {
    const data = await apiCall('/projects');
    if (!data) return;
    
    const container = document.getElementById('projects-list');
    
    if (data.projects && data.projects.length > 0) {
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Language</th>
                        <th>Stars</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.projects.map(p => `
                        <tr>
                            <td><strong>${p.name}</strong></td>
                            <td>${p.description || '-'}</td>
                            <td>${p.language || '-'}</td>
                            <td>${p.stars}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-primary" onclick="editProject(${p.id})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteProject(${p.id})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        container.innerHTML = '<p>No projects found. Add your first project!</p>';
    }
}

function showProjectModal() {
    alert('Project modal - Implementation needed');
    // TODO: Implement project modal
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const result = await apiCall(`/projects/${projectId}`, 'DELETE');
    if (result && result.success) {
        alert('Project deleted successfully!');
        loadProjects();
    }
}

// ==================== BLOG MANAGEMENT ====================

async function loadBlogs() {
    const data = await apiCall('/blogs');
    if (!data) return;
    
    const container = document.getElementById('blogs-list');
    
    if (data.blogs && data.blogs.length > 0) {
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Published</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.blogs.map(b => `
                        <tr>
                            <td><strong>${b.title}</strong></td>
                            <td>${b.category || '-'}</td>
                            <td>${b.published ? '<span style="color: green;">✓ Yes</span>' : '<span style="color: red;">✗ No</span>'}</td>
                            <td>${new Date(b.created_at).toLocaleDateString()}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-primary" onclick="editBlog(${b.id})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteBlog(${b.id})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        container.innerHTML = '<p>No blogs found. Add your first blog post!</p>';
    }
}

function showBlogModal() {
    alert('Blog modal - Implementation needed');
    // TODO: Implement blog modal
}

async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    const result = await apiCall(`/blogs/${blogId}`, 'DELETE');
    if (result && result.success) {
        alert('Blog deleted successfully!');
        loadBlogs();
    }
}

// ==================== SERVICE MANAGEMENT ====================

async function loadServices() {
    const data = await apiCall('/services');
    if (!data) return;
    
    const container = document.getElementById('services-list');
    
    if (data.services && data.services.length > 0) {
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Visible</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.services.map(s => `
                        <tr>
                            <td><strong>${s.title}</strong></td>
                            <td>${s.description ? s.description.substring(0, 50) + '...' : '-'}</td>
                            <td>${s.visible ? '<span style="color: green;">✓ Yes</span>' : '<span style="color: red;">✗ No</span>'}</td>
                            <td>${s.order}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-primary" onclick="editService(${s.id})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteService(${s.id})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        container.innerHTML = '<p>No services found. Add your first service!</p>';
    }
}

function showServiceModal() {
    alert('Service modal - Implementation needed');
    // TODO: Implement service modal
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    const result = await apiCall(`/services/${serviceId}`, 'DELETE');
    if (result && result.success) {
        alert('Service deleted successfully!');
        loadServices();
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
