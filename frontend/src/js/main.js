// Main JavaScript functionality for Asif Karim Portfolio

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        this.body = document.body;
        this.init();
    }

    init() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Add event listener for theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update icon
        if (theme === 'dark') {
            this.themeIcon.className = 'fas fa-sun';
        } else {
            this.themeIcon.className = 'fas fa-moon';
        }
    }

    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Scroll effect for navbar
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Smooth scroll for anchor links
        this.initSmoothScroll();
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }

    handleScroll() {
        if (window.scrollY > 100) {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.boxShadow = 'none';
        }
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Projects Manager
class ProjectsManager {
    constructor() {
        this.projectsGrid = document.getElementById('projects-grid');
        this.loadingState = document.getElementById('projects-loading');
        this.errorState = document.getElementById('projects-error');
        this.emptyState = document.getElementById('projects-empty');
    }

    async loadProjects() {
        this.showLoadingState();

        try {
            const response = await fetch('/api/projects');
            const data = await response.json();

            if (response.ok && data.projects && data.projects.length > 0) {
                this.renderProjects(data.projects);
                this.showProjectsGrid();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        this.loadingState.style.display = 'block';
        this.projectsGrid.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    showProjectsGrid() {
        this.loadingState.style.display = 'none';
        this.projectsGrid.style.display = 'grid';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    showErrorState() {
        this.loadingState.style.display = 'none';
        this.projectsGrid.style.display = 'none';
        this.errorState.style.display = 'block';
        this.emptyState.style.display = 'none';
    }

    showEmptyState() {
        this.loadingState.style.display = 'none';
        this.projectsGrid.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    renderProjects(projects) {
        this.projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <div class="project-stats">
                        <span class="stat">
                            <i class="fas fa-star"></i>
                            ${project.stars}
                        </span>
                        <span class="stat">
                            <i class="fas fa-code-branch"></i>
                            ${project.forks}
                        </span>
                    </div>
                </div>
                
                <div class="project-content">
                    <p class="project-description">${this.escapeHtml(project.description)}</p>
                    
                    ${project.language ? `
                        <div class="project-language">
                            <span class="language-dot"></span>
                            ${this.escapeHtml(project.language)}
                        </div>
                    ` : ''}
                </div>
                
                <div class="project-footer">
                    <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <i class="fab fa-github"></i>
                        View on GitHub
                    </a>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Blogs Manager
class BlogsManager {
    constructor() {
        this.blogGrid = document.getElementById('blog-grid');
        this.loadingState = document.getElementById('blogs-loading');
        this.errorState = document.getElementById('blogs-error');
        this.emptyState = document.getElementById('blogs-empty');
    }

    async loadBlogs() {
        this.showLoadingState();

        try {
            const response = await fetch('/api/blogs');
            const data = await response.json();

            if (response.ok && data.blogs && data.blogs.length > 0) {
                this.renderBlogs(data.blogs);
                this.showBlogGrid();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading blogs:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        this.loadingState.style.display = 'block';
        this.blogGrid.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    showBlogGrid() {
        this.loadingState.style.display = 'none';
        this.blogGrid.style.display = 'grid';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    showErrorState() {
        this.loadingState.style.display = 'none';
        this.blogGrid.style.display = 'none';
        this.errorState.style.display = 'block';
        this.emptyState.style.display = 'none';
    }

    showEmptyState() {
        this.loadingState.style.display = 'none';
        this.blogGrid.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    renderBlogs(blogs) {
        this.blogGrid.innerHTML = blogs.map(blog => `
            <article class="blog-card">
                <div class="blog-image">
                    <div class="blog-placeholder">
                        <i class="fas fa-blog"></i>
                    </div>
                </div>
                
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-date">${new Date(blog.date).toLocaleDateString()}</span>
                        <span class="blog-category">${this.escapeHtml(blog.category || 'General')}</span>
                    </div>
                    
                    <h3 class="blog-title">${this.escapeHtml(blog.title)}</h3>
                    <p class="blog-excerpt">${this.escapeHtml(blog.description)}</p>
                    
                    <div class="blog-tags">
                        ${blog.tags ? blog.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') : ''}
                    </div>
                    
                    <a href="${blog.link}" target="_blank" rel="noopener noreferrer" class="blog-link">
                        Read More
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Contact Form Manager
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.successMessage = document.getElementById('success-message');
        this.errorMessage = document.getElementById('error-message');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const submitBtn = this.form.querySelector('button[type="submit"]');
        
        // Hide previous messages
        this.hideMessages();
        
        // Disable submit button and show loading
        this.setLoadingState(submitBtn, true);
        
        try {
            const response = await fetch('/contact', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.showSuccessMessage();
                this.form.reset();
            } else {
                this.showErrorMessage();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showErrorMessage();
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }

    showSuccessMessage() {
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }

    showErrorMessage() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'block';
    }

    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
}

// Newsletter Manager
class NewsletterManager {
    constructor() {
        this.form = document.getElementById('newsletter-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const email = this.form.querySelector('input[type="email"]').value;
        
        if (email) {
            // Simple validation
            if (this.isValidEmail(email)) {
                alert('Thank you for subscribing! You\'ll receive updates about new blog posts.');
                this.form.reset();
            } else {
                alert('Please enter a valid email address.');
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // Intersection Observer for animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        this.observeElements();
        
        // Animate stats numbers
        this.animateStats();
    }

    observeElements() {
        const elementsToAnimate = document.querySelectorAll('.skill-card, .service-card, .project-card, .blog-card, .timeline-item');
        elementsToAnimate.forEach(el => {
            this.observer.observe(el);
        });
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        });
        
        stats.forEach(stat => statsObserver.observe(stat));
    }

    animateNumber(element) {
        const target = parseInt(element.dataset.target);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 30);
    }
}

// Utility Functions
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Global Functions for Templates
window.loadProjects = function() {
    if (window.projectsManager) {
        window.projectsManager.loadProjects();
    }
};

window.loadBlogs = function() {
    if (window.blogsManager) {
        window.blogsManager.loadBlogs();
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    window.themeManager = new ThemeManager();
    window.navigationManager = new NavigationManager();
    window.animationManager = new AnimationManager();
    
    // Initialize page-specific managers
    if (document.getElementById('projects-grid')) {
        window.projectsManager = new ProjectsManager();
        window.projectsManager.loadProjects();
    }
    
    if (document.getElementById('blog-grid')) {
        window.blogsManager = new BlogsManager();
        window.blogsManager.loadBlogs();
    }
    
    if (document.getElementById('contact-form')) {
        window.contactFormManager = new ContactFormManager();
    }
    
    if (document.getElementById('newsletter-form')) {
        window.newsletterManager = new NewsletterManager();
    }
    
    // Add loading animation to page
    document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden
        console.log('Page hidden');
    } else {
        // Page is visible
        console.log('Page visible');
    }
});

// Handle window resize
window.addEventListener('resize', Utils.debounce(function() {
    // Handle responsive adjustments
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
}, 250));

// Handle scroll events
window.addEventListener('scroll', Utils.throttle(function() {
    // Handle scroll-based animations
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero && scrollY < windowHeight) {
        hero.style.transform = `translateY(${scrollY * 0.5}px)`;
    }
}, 16));

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        NavigationManager,
        ProjectsManager,
        BlogsManager,
        ContactFormManager,
        NewsletterManager,
        AnimationManager,
        Utils
    };
}
