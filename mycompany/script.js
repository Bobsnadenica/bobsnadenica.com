/**
 * MyCompany Next-Gen Portal Engine
 * Senior Engineering Standard: Zero Dead Ends.
 */

const routes = {
    '': { title: 'The Hub', view: 'home.html', isStatic: true },
    'data-engine': { title: 'Empirical Intelligence', view: 'data-engine.html' },
    'b2b': { title: 'Enterprise Engineering', view: 'b2b.html' },
    'personal-it': { title: 'Elite Concierge', view: 'personal-it.html' },
    'architecture': { title: 'Architecture Canvas', view: 'architecture.html' },
    'privacy': { title: 'Privacy Protocol', view: 'privacy.html' },
    'faq': { title: 'Knowledge Base', view: 'faq.html' }
};

const hubView = document.getElementById('hub-view');
const dynamicView = document.getElementById('dynamic-view');

/**
 * Normalizes the path to match route keys
 */
const getRouteKey = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p !== '' && p !== 'index.html');
    const lastPart = parts[parts.length - 1] || '';
    return routes.hasOwnProperty(lastPart) ? lastPart : '';
};

/**
 * SPA Router
 */
const router = async () => {
    const key = getRouteKey();
    const route = routes[key];
    
    // Update active state in nav
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if ((key === '' && (href === './' || href === 'index.html')) || (key !== '' && href.includes(key))) {
            link.classList.add('active');
        }
    });

    if (key === '') {
        // Show integrated Hub
        dynamicView.style.display = 'none';
        hubView.style.display = 'block';
        document.title = `MyCompany | ${route.title}`;
        return;
    }

    // Hide Hub, show Dynamic
    hubView.style.display = 'none';
    dynamicView.style.display = 'block';
    dynamicView.innerHTML = '<p style="opacity:0.5; letter-spacing:0.2em; text-transform:uppercase; font-size:0.7rem;">Establishing Connection...</p>';

    try {
        const response = await fetch(`views/${route.view}`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        
        dynamicView.innerHTML = html;
        document.title = `MyCompany | ${route.title}`;
        
        // Re-init any view-specific logic if needed
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Portal Error:', error);
        dynamicView.innerHTML = `
            <div style="padding: 4rem; border: 1px solid var(--border-color); background: var(--bg-glass);">
                <h2 style="font-family: var(--font-authority); margin-bottom:1rem;">Protocol Interrupted</h2>
                <p style="color: var(--text-muted); margin-bottom:2rem;">The requested node [${route.view}] could not be reached.</p>
                <a href="./" data-link class="btn-metal">Return to Hub</a>
            </div>`;
    }
};

/**
 * Navigation
 */
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

/**
 * Interactive Particle Engine
 */
class NodeEngine {
    constructor(id) {
        this.canvas = document.getElementById(id);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.init());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        for (let i = 0; i < Math.min(count, 120); i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            this.ctx.fillStyle = 'rgba(136, 136, 136, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Connections
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    this.ctx.strokeStyle = `rgba(136, 136, 136, ${(1 - dist / 150) * 0.15})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * Magnetic Card Glow
 */
const initGlows = () => {
    document.addEventListener('mousemove', e => {
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
};

/**
 * Event Listeners
 */
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        // Only intercept if it's internal
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            e.preventDefault();
            navigateTo(link.href);
        }
    }
});

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
    new NodeEngine('bg-canvas');
    initGlows();
    router();
});
