/**
 * MyCompany Next-Gen Portal Router
 * Optimized for GitHub Pages and Subfolder Deployments
 */

const routes = {
    '': { title: 'Hub', view: 'home.html' },
    'data-engine': { title: 'Intelligence', view: 'data-engine.html' },
    'b2b': { title: 'Engineering', view: 'b2b.html' },
    'personal-it': { title: 'Concierge', view: 'personal-it.html' },
    'architecture': { title: 'Architecture', view: 'architecture.html' }
};

const appRoot = document.getElementById('app-root');

/**
 * Normalizes the current path to match a route key, 
 * accounting for GitHub Pages subfolders.
 */
const getRouteKey = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p !== '' && p !== 'index.html');
    
    // If we're in a subfolder like /mycompany/data-engine
    // we want the last part if it matches a route, otherwise ''
    const lastPart = parts[parts.length - 1] || '';
    
    return routes.hasOwnProperty(lastPart) ? lastPart : '';
};

/**
 * Navigates to a specific URL
 */
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

/**
 * Fetches and injects view content with transitions
 */
const router = async () => {
    const key = getRouteKey();
    const route = routes[key];
    
    // Update active link
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if ((key === '' && (href === './' || href === 'index.html')) || (key !== '' && href.includes(key))) {
            link.classList.add('active');
        }
    });

    // Transition: Fade Out
    const currentContainer = appRoot.querySelector('.view-container');
    if (currentContainer) {
        currentContainer.classList.add('fade-out');
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    try {
        // Use relative path to views/ folder
        // On GH Pages, if index.html is at /mycompany/, views is at /mycompany/views/
        const response = await fetch(`views/${route.view}`);
        if (!response.ok) throw new Error(`Signal lost: ${route.view} (${response.status})`);
        const html = await response.text();
        
        appRoot.innerHTML = `<div class="view-container fade-in">${html}</div>`;
        document.title = `MyCompany | ${route.title}`;

        const nextContainer = appRoot.querySelector('.view-container');
        if (nextContainer) {
            nextContainer.offsetHeight; // Force reflow
            nextContainer.classList.remove('fade-in');
        }

    } catch (error) {
        console.error('Routing error:', error);
        appRoot.innerHTML = `
            <div class="view-container">
                <h1>Connection Interrupted</h1>
                <p>${error.message}</p>
                <p><a href="./" data-link>Reconnect to Hub</a></p>
            </div>`;
    }
};

// Handle Back/Forward
window.addEventListener('popstate', router);

// Global Interceptor
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        navigateTo(link.href);
    }
    
    const layerCard = e.target.closest('.layer-card');
    if (layerCard) {
        const layer = layerCard.dataset.layer;
        const detailsContent = document.getElementById('details-content');
        if (detailsContent) {
            updateCanvasDetails(layer, detailsContent);
        }
    }
});

const updateCanvasDetails = (layer, container) => {
    const data = {
        edge: { title: 'Edge Layer', p: 'Global delivery via high-performance CDN nodes.' },
        compute: { title: 'Compute Layer', p: 'Dynamic orchestration of containerized workloads.' },
        data: { title: 'Data Layer', p: 'Highly available, distributed database systems.' },
        security: { title: 'Security Layer', p: 'Zero-trust architecture with granular IAM.' }
    };
    const info = data[layer];
    if (info) container.innerHTML = `<h2>${info.title}</h2><p>${info.p}</p>`;
};
/**
 * Interactive Particle Network Background
 */
class ParticleNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numParticles = 80;
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null };

        this.init();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        this.animate();
    }

    init() {
        this.resize();
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const alpha = 1 - dist / this.connectionDistance;
                    this.ctx.strokeStyle = `rgba(136, 136, 136, ${alpha * 0.2})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            const mdx = this.particles[i].x - this.mouse.x;
            const mdy = this.particles[i].y - this.mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 200) {
                const alpha = 1 - mDist / 200;
                this.ctx.strokeStyle = `rgba(204, 204, 204, ${alpha * 0.3})`;
                this.ctx.beginPath();
                this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            this.ctx.fillStyle = 'rgba(136, 136, 136, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    new ParticleNetwork('bg-canvas');
    if (window.location.protocol === 'file:') {
...
        appRoot.innerHTML = `<div class="view-container"><h1>Local File Detected</h1><p>Please use a local web server (CORS required).</p></div>`;
    } else {
        router();
    }
});
