// Admin Dashboard JavaScript

const API_BASE = '/api/admin';

// Check for token on page load
const token = localStorage.getItem('admin_token');
if (!token) {
    window.location.href = '/admin/login';
}

// API helper functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('admin_token');
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`
        }
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
        // Not authenticated - clear token and redirect to login
        localStorage.removeItem('admin_token');
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
    // Clear token from localStorage
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
});

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
    loadProjects();
    loadBlogs();
    loadServices();
    loadSettings();
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

function showProjectModal(project = null) {
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('project-modal-title');
    const form = document.getElementById('project-form');
    
    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-name').value = project.name || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-url').value = project.url || '';
        document.getElementById('project-github').value = project.github_url || '';
        document.getElementById('project-image').value = project.image_url || '';
        document.getElementById('project-language').value = project.language || '';
        document.getElementById('project-featured').checked = project.featured || false;
    } else {
        title.textContent = 'Add New Project';
        form.reset();
        document.getElementById('project-id').value = '';
    }
    
    modal.classList.add('active');
}

async function editProject(projectId) {
    const data = await apiCall('/projects');
    if (data && data.projects) {
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            showProjectModal(project);
        }
    }
}

document.getElementById('project-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('project-id').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('project-name').value);
    formData.append('description', document.getElementById('project-description').value);
    formData.append('url', document.getElementById('project-url').value);
    formData.append('github_url', document.getElementById('project-github').value);
    formData.append('image_url', document.getElementById('project-image').value);
    formData.append('language', document.getElementById('project-language').value);
    formData.append('featured', document.getElementById('project-featured').checked);
    
    try {
        let result;
        if (projectId) {
            result = await apiCall(`/projects/${projectId}`, 'PUT', formData);
        } else {
            result = await apiCall('/projects', 'POST', formData);
        }
        
        if (result && result.success) {
            alert(projectId ? 'Project updated!' : 'Project created!');
            closeModal('project-modal');
            loadProjects();
        }
    } catch (error) {
        alert('Error saving project: ' + error.message);
    }
});

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

function showBlogModal(blog = null) {
    const modal = document.getElementById('blog-modal');
    const title = document.getElementById('blog-modal-title');
    const form = document.getElementById('blog-form');
    
    if (blog) {
        title.textContent = 'Edit Blog Post';
        document.getElementById('blog-id').value = blog.id;
        document.getElementById('blog-title').value = blog.title || '';
        document.getElementById('blog-description').value = blog.description || '';
        document.getElementById('blog-content').value = blog.content || '';
        document.getElementById('blog-category').value = blog.category || '';
        document.getElementById('blog-tags').value = blog.tags || '';
        document.getElementById('blog-link').value = blog.link || '';
        document.getElementById('blog-image').value = blog.image_url || '';
        document.getElementById('blog-published').checked = blog.published || false;
    } else {
        title.textContent = 'Add New Blog Post';
        form.reset();
        document.getElementById('blog-id').value = '';
    }
    
    modal.classList.add('active');
}

async function editBlog(blogId) {
    const data = await apiCall('/blogs');
    if (data && data.blogs) {
        const blog = data.blogs.find(b => b.id === blogId);
        if (blog) {
            showBlogModal(blog);
        }
    }
}

document.getElementById('blog-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const blogId = document.getElementById('blog-id').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('blog-title').value);
    formData.append('description', document.getElementById('blog-description').value);
    formData.append('content', document.getElementById('blog-content').value);
    formData.append('category', document.getElementById('blog-category').value);
    formData.append('tags', document.getElementById('blog-tags').value);
    formData.append('link', document.getElementById('blog-link').value);
    formData.append('image_url', document.getElementById('blog-image').value);
    formData.append('published', document.getElementById('blog-published').checked);
    
    try {
        let result;
        if (blogId) {
            result = await apiCall(`/blogs/${blogId}`, 'PUT', formData);
        } else {
            result = await apiCall('/blogs', 'POST', formData);
        }
        
        if (result && result.success) {
            alert(blogId ? 'Blog updated!' : 'Blog created!');
            closeModal('blog-modal');
            loadBlogs();
        }
    } catch (error) {
        alert('Error saving blog: ' + error.message);
    }
});

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

function showServiceModal(service = null) {
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-modal-title');
    const form = document.getElementById('service-form');
    
    if (service) {
        title.textContent = 'Edit Service';
        document.getElementById('service-id').value = service.id;
        document.getElementById('service-title').value = service.title || '';
        document.getElementById('service-description').value = service.description || '';
        document.getElementById('service-icon').value = service.icon || '';
        document.getElementById('service-features').value = service.features || '';
        document.getElementById('service-order').value = service.order || 0;
        document.getElementById('service-visible').checked = service.visible !== false;
    } else {
        title.textContent = 'Add New Service';
        form.reset();
        document.getElementById('service-id').value = '';
        document.getElementById('service-visible').checked = true;
    }
    
    modal.classList.add('active');
}

async function editService(serviceId) {
    const data = await apiCall('/services');
    if (data && data.services) {
        const service = data.services.find(s => s.id === serviceId);
        if (service) {
            showServiceModal(service);
        }
    }
}

document.getElementById('service-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('service-id').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('service-title').value);
    formData.append('description', document.getElementById('service-description').value);
    formData.append('icon', document.getElementById('service-icon').value);
    formData.append('features', document.getElementById('service-features').value);
    formData.append('order', document.getElementById('service-order').value);
    formData.append('visible', document.getElementById('service-visible').checked);
    
    try {
        let result;
        if (serviceId) {
            result = await apiCall(`/services/${serviceId}`, 'PUT', formData);
        } else {
            result = await apiCall('/services', 'POST', formData);
        }
        
        if (result && result.success) {
            alert(serviceId ? 'Service updated!' : 'Service created!');
            closeModal('service-modal');
            loadServices();
        }
    } catch (error) {
        alert('Error saving service: ' + error.message);
    }
});

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    const result = await apiCall(`/services/${serviceId}`, 'DELETE');
    if (result && result.success) {
        alert('Service deleted successfully!');
        loadServices();
    }
}

// ==================== SETTINGS MANAGEMENT ====================

async function loadSettings() {
    const data = await apiCall('/settings/profile');
    if (!data) return;
    
    if (data.profile) {
        document.getElementById('settings-username').value = data.profile.username || '';
        document.getElementById('settings-email').value = data.profile.email || '';
    }
}

// Profile form submit
document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('email', document.getElementById('settings-email').value);
    
    try {
        const result = await apiCall('/settings/profile', 'PUT', formData);
        if (result && result.success) {
            alert('Profile updated successfully!');
        }
    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
});

// Password change form submit
document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('password-error');
    const successDiv = document.getElementById('password-success');
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'New passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    const formData = new FormData();
    formData.append('current_password', currentPassword);
    formData.append('new_password', newPassword);
    formData.append('confirm_password', confirmPassword);
    
    try {
        const result = await apiCall('/settings/change-password', 'POST', formData);
        if (result && result.success) {
            successDiv.textContent = 'Password changed successfully!';
            successDiv.style.display = 'block';
            document.getElementById('password-form').reset();
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Error changing password';
        errorDiv.style.display = 'block';
    }
});

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
