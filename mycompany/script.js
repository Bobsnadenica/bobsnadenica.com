/**
 * MyCompany Monolith Engine
 * Senior Engineering Standard.
 */

const routes = {
    '': { title: 'Sovereign', view: 'home.html', isStatic: true },
    'solutions': { title: 'Manifest', view: 'solutions.html' },
    'data-engine': { title: 'Intelligence', view: 'data-engine.html' },
    'b2b': { title: 'Architecture', view: 'b2b.html' },
    'personal-it': { title: 'Private', view: 'personal-it.html' },
    'privacy': { title: 'Protocol', view: 'privacy.html' },
    'faq': { title: 'Knowledge', view: 'faq.html' }
};

const hubView = document.getElementById('hub-view');
const dynamicView = document.getElementById('dynamic-view');
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

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
        dynamicView.style.display = 'none';
        hubView.style.display = 'block';
        document.title = `MyCompany | ${route.title}`;
        document.body.classList.remove('is-loading');
        return;
    }

    hubView.style.display = 'none';
    dynamicView.style.display = 'block';
    document.body.classList.add('is-loading'); // Reset reveals

    try {
        const response = await fetch(`views/${route.view}`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        
        dynamicView.innerHTML = html;
        document.title = `MyCompany | ${route.title}`;
        
        // Trigger reveal after injection
        setTimeout(() => {
            document.body.classList.remove('is-loading');
        }, 100);

        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Portal Error:', error);
        dynamicView.innerHTML = `
            <div style="padding: 10rem var(--gap); text-align: center;">
                <h2 style="font-family: var(--f-display); font-size: 3rem; margin-bottom: 2rem;">Connection Interrupted</h2>
                <a href="./" data-link class="btn-hud">Return to Hub</a>
            </div>`;
        document.body.classList.remove('is-loading');
    }
};

/**
 * Custom Cursor Logic
 */
const initCursor = () => {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        
        // Check for hover
        const target = e.target.closest('a, button, [data-magnetic]');
        if (target) {
            document.body.classList.add('cursor-hover');
        } else {
            document.body.classList.remove('cursor-hover');
        }
    });

    const loop = () => {
        followerX += (mouseX - followerX - 20) * 0.1;
        followerY += (mouseY - followerY - 20) * 0.1;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        requestAnimationFrame(loop);
    };
    loop();
};

/**
 * Magnetic Elements
 */
const initMagnetic = () => {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate3d(0, 0, 0)`;
        });
    });
};

/**
 * Atmospheric Data Field
 */
class DataField {
    constructor(id) {
        this.canvas = document.getElementById(id);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.init());
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        const count = Math.floor((this.canvas.width * this.canvas.height) / 10000);
        for (let i = 0; i < Math.min(count, 150); i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 0.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 2 + 0.5
            });
        }
    }

    animate() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx * p.z;
            p.y += p.vy * p.z;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            const opacity = 0.1 * p.z;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Subtle web
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.05;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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
 * Event Interceptor
 */
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            e.preventDefault();
            history.pushState(null, null, link.href);
            router();
        }
    }
});

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
    new DataField('bg-canvas');
    initCursor();
    initMagnetic();
    router();
});
