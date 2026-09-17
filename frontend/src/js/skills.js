const SKILL_CATEGORIES = [
    {
        icon: 'fas fa-robot',
        name: 'Agentic AI & LLM Systems',
        skills: [
            'LangChain',
            'LangGraph',
            'RAG',
            'Multi-Agent Orchestration',
            'Gemini/LLM API Integration',
            'Prompt Engineering'
        ]
    },
    {
        icon: 'fas fa-server',
        name: 'Backend & Infra',
        skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Cloud Deployment', 'Git', 'Linux']
    },
    {
        icon: 'fas fa-layer-group',
        name: 'Supporting',
        skills: ['Vector Databases', 'Web Scraping', 'Streamlit', 'MongoDB', 'JavaScript']
    },
    {
        icon: 'fas fa-brain',
        name: 'Machine Learning & AI',
        skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV', 'NLTK']
    },
    {
        icon: 'fas fa-chart-bar',
        name: 'Data Science',
        skills: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter', 'SQL']
    },
    {
        icon: 'fas fa-cloud',
        name: 'Cloud & Tools',
        skills: ['AWS', 'Google Cloud']
    },
    {
        icon: 'fas fa-code',
        name: 'Web Development',
        skills: ['Flask', 'Django', 'HTML/CSS']
    }
];

function renderSkills() {
    const container = document.getElementById('skills-categories');
    if (!container) return;

    container.innerHTML = SKILL_CATEGORIES.map(category => `
        <div class="skill-category">
            <h3><i class="${category.icon}"></i> ${category.name}</h3>
            <div class="skill-tags">
                ${category.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderSkills);
