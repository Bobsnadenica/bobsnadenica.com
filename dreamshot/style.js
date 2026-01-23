document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));


    // 2. Marquee Pause on Hover
    const marquee = document.querySelector('.marquee-track');
    if(marquee) {
        marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
        marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
    }


    // 3. Crack the Code Button
    const btn = document.getElementById('crackCodeBtn');
    if(btn) {
        btn.addEventListener('click', () => {
            btn.innerHTML = "ACCESS GRANTED... 😺";
            btn.style.background = "#4CAF50";
            
            setTimeout(() => {
                alert("Meow! You've unlocked the secret cat level! (This mimics the interactive functionality)");
                btn.innerHTML = "CRACK THE CODE";
                btn.style.background = "";
            }, 1000);
        });
    }

    // 4. Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            // Toggle logic for mobile menu
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0d0d0d';
                navLinks.style.padding = '30px';
                navLinks.style.borderBottom = '1px solid #333';
            }
        });
    }
});