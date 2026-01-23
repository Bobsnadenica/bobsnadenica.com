document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Animations (Intersection Observer) ---
    // This finds all elements with class 'fade-in-up' and animates them
    // when they appear on screen.
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));


    // --- Marquee Hover Effect (Pause on Hover) ---
    const marquee = document.querySelector('.marquee-content');
    if(marquee) {
        marquee.addEventListener('mouseenter', () => {
            marquee.style.animationPlayState = 'paused';
        });
        marquee.addEventListener('mouseleave', () => {
            marquee.style.animationPlayState = 'running';
        });
    }


    // --- "Crack the Code" Button Logic ---
    const crackBtn = document.getElementById('crackCodeBtn');
    if (crackBtn) {
        crackBtn.addEventListener('click', () => {
            // Simple animation and alert to simulate the interactive feature
            crackBtn.innerText = "ACCESS GRANTED";
            crackBtn.style.backgroundColor = "#0f0";
            crackBtn.style.color = "#000";
            
            setTimeout(() => {
                alert("🐈 SECRET CAT LEVEL UNLOCKED! 🐈\n\n(This is where the real site would load a puzzle or form.)");
                crackBtn.innerText = "CRACK THE CODE";
                crackBtn.style.backgroundColor = "";
                crackBtn.style.color = "";
            }, 500);
        });
    }

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // Toggle menu visibility (you'd add CSS for .active state usually)
            // For now, simple toggle:
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#000';
                navLinks.style.padding = '20px';
            }
        });
    }
});