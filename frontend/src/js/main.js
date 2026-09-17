const GITHUB_REPOSITORIES_URL = 'https://api.github.com/users/asiifkarim/repos?sort=updated';

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        this.body = document.body;
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (this.themeIcon) {
            this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.setTheme(this.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
}

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.hamburger.classList.toggle('active');
                this.navMenu.classList.toggle('active');
            });
        }
        this.navLinks.forEach(link => link.addEventListener('click', () => this.closeMobileMenu()));
        window.addEventListener('scroll', () => this.handleScroll());
    }

    closeMobileMenu() {
        if (this.hamburger) this.hamburger.classList.remove('active');
        if (this.navMenu) this.navMenu.classList.remove('active');
    }

    handleScroll() {
        if (!this.navbar) return;
        this.navbar.style.background = window.scrollY > 100
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(255, 255, 255, 0.95)';
        this.navbar.style.boxShadow = window.scrollY > 100
            ? '0 2px 20px rgba(0, 0, 0, 0.1)'
            : 'none';
    }
}

class AnimationManager {
    constructor() {
        this.observeElements();
        this.animateStats();
    }

    observeElements() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.skill-card, .service-card, .project-card, .timeline-item')
            .forEach(element => observer.observe(element));
    }

    animateStats() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        document.querySelectorAll('.stat-number').forEach(stat => observer.observe(stat));
    }

    animateNumber(element) {
        const target = parseInt(element.dataset.target, 10);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            element.textContent = Math.floor(current);
            if (current >= target) clearInterval(timer);
        }, 30);
    }
}

class NewsletterManager {
    constructor() {
        this.form = document.getElementById('newsletter-form');
        if (this.form) {
            this.form.addEventListener('submit', event => {
                event.preventDefault();
                alert('Thank you for subscribing! You\'ll receive updates about new blog posts.');
                this.form.reset();
            });
        }
    }
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value || '';
    return element.innerHTML;
}

async function loadProjects() {
    const loading = document.getElementById('projects-loading');
    const grid = document.getElementById('projects-grid');
    const error = document.getElementById('projects-error');
    const empty = document.getElementById('projects-empty');
    if (!grid) return;

    loading.style.display = 'block';
    grid.style.display = 'none';
    error.style.display = 'none';
    empty.style.display = 'none';

    try {
        const response = await fetch(GITHUB_REPOSITORIES_URL);
        if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
        const repositories = await response.json();
        const projects = repositories
            .filter(repository => !repository.fork)
            .sort((left, right) => right.stargazers_count - left.stargazers_count
                || new Date(right.updated_at) - new Date(left.updated_at));

        if (!projects.length) {
            empty.style.display = 'block';
            return;
        }

        grid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-title">${escapeHtml(project.name)}</h3>
                    <div class="project-stats">
                        <span class="stat"><i class="fas fa-star"></i> ${project.stargazers_count}</span>
                        <span class="stat"><i class="fas fa-code-branch"></i> ${project.forks_count}</span>
                    </div>
                </div>
                <div class="project-content">
                    <p class="project-description">${escapeHtml(project.description || 'No description available')}</p>
                    ${project.language ? `<div class="project-language"><span class="language-dot"></span>${escapeHtml(project.language)}</div>` : ''}
                </div>
                <div class="project-footer">
                    <a href="${escapeHtml(project.html_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                </div>
            </div>
        `).join('');
        grid.style.display = 'grid';
    } catch (requestError) {
        console.error('Error loading GitHub projects:', requestError);
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

window.loadProjects = loadProjects;

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    new AnimationManager();
    new NewsletterManager();
    loadProjects();
    document.body.classList.add('loaded');
});

window.addEventListener('resize', () => {
    document.body.classList.toggle('mobile', window.innerWidth <= 768);
});

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero && window.scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${window.scrollY * 0.5}px)`;
    }
});
