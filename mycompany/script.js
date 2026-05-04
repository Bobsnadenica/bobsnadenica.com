/**
 * MyCompany Next-Gen Portal Router
 * Custom Vanilla SPA Router with Cinematic Transitions
 */

const routes = {
    '/': { title: 'Hub', view: 'home.html' },
    '/data-engine': { title: 'Intelligence', view: 'data-engine.html' },
    '/b2b': { title: 'Engineering', view: 'b2b.html' },
    '/personal-it': { title: 'Concierge', view: 'personal-it.html' },
    '/architecture': { title: 'Architecture', view: 'architecture.html' }
};

const appRoot = document.getElementById('app-root');
const navLinks = document.querySelectorAll('[data-link]');

/**
 * Navigates to a specific URL
 * @param {string} url 
 */
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

/**
 * Fetches and injects view content with transitions
 */
const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];
    
    // Update active link
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

    // Start Transition: Fade Out
    const currentContainer = appRoot.querySelector('.view-container');
    if (currentContainer) {
        currentContainer.classList.add('fade-out');
        await new Promise(resolve => setTimeout(resolve, 400)); // Match CSS transition speed
    }

    try {
        const response = await fetch(`/views/${route.view}`);
        if (!response.ok) throw new Error('View not found');
        const html = await response.text();
        
        // Inject new content
        appRoot.innerHTML = `<div class="view-container fade-in">${html}</div>`;
        document.title = `MyCompany | ${route.title}`;

        // Trigger Fade In
        const nextContainer = appRoot.querySelector('.view-container');
        // Force reflow
        nextContainer.offsetHeight;
        nextContainer.classList.remove('fade-in');

    } catch (error) {
        console.error('Routing error:', error);
        appRoot.innerHTML = `<div class="view-container"><h1>404</h1><p>The signal was lost. <a href="/" data-link>Return to Hub</a></p></div>`;
    }
};

// Handle Back/Forward
window.addEventListener('popstate', router);

// Global Link Interceptor
document.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        navigateTo(e.target.href);
    }
    
    // Architecture Canvas Interactivity
    const layerCard = e.target.closest('.layer-card');
    if (layerCard) {
        const layer = layerCard.dataset.layer;
        const detailsContent = document.getElementById('details-content');
        if (detailsContent) {
            updateCanvasDetails(layer, detailsContent);
        }
    }
});

/**
 * Updates the architecture canvas details based on selected layer
 */
const updateCanvasDetails = (layer, container) => {
    const data = {
        edge: {
            title: 'Edge Layer',
            p: 'Global delivery via high-performance CDN nodes. Integrated WAF and DDoS mitigation powered by real-time telemetry.'
        },
        compute: {
            title: 'Compute Layer',
            p: 'Dynamic orchestration of containerized workloads and serverless functions. Auto-scaling clusters designed for variable demand.'
        },
        data: {
            title: 'Data Layer',
            p: 'Highly available, distributed database systems with automated failover and regional replication for absolute data integrity.'
        },
        security: {
            title: 'Security Layer',
            p: 'Zero-trust architecture with granular IAM policies and end-to-end encryption. Every request is verified, every byte is protected.'
        }
    };

    const info = data[layer];
    if (info) {
        container.innerHTML = `<h2>${info.title}</h2><p>${info.p}</p>`;
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    router();
});
