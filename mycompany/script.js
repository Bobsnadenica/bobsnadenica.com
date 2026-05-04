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

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.protocol === 'file:') {
        appRoot.innerHTML = `<div class="view-container"><h1>Local File Detected</h1><p>Please use a local web server (CORS required).</p></div>`;
    } else {
        router();
    }
});
