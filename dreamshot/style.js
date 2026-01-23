document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Enhanced Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated to save resources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => scrollObserver.observe(el));


    // --- 2. Sticky Navbar Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            navbar.style.padding = '15px 40px'; // Shrink slightly
        } else {
            navbar.style.background = 'rgba(13, 13, 13, 0.9)';
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '20px 40px';
        }
    });


    // --- 3. Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    navLinks.style.display = 'none';
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });


    // --- 4. Hacker Typer Effect for Hero Title ---
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const text = heroTitle.innerText;
        heroTitle.innerText = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Speed of typing
            }
        }
        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }


    // --- 5. "Crack the Code" Digital Glitch Logic ---
    const crackBtn = document.getElementById('crackCodeBtn');
    
    if (crackBtn) {
        crackBtn.addEventListener('click', () => {
            // Glitch visual effect
            let originalText = crackBtn.innerText;
            const glitchChars = '!@#$%^&*()<>?/';
            let glitchInterval;
            let counter = 0;

            // Start glitching text
            glitchInterval = setInterval(() => {
                crackBtn.innerText = originalText.split('')
                    .map((char, index) => {
                        if(index < counter) return "ACCESS GRANTED"[index]; 
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('');
                
                counter += 1/3; 

                if(counter >= "ACCESS GRANTED".length) {
                    clearInterval(glitchInterval);
                    crackBtn.innerText = "ACCESS GRANTED";
                    crackBtn.style.backgroundColor = "#00ff00";
                    crackBtn.style.color = "#000";
                    crackBtn.style.boxShadow = "0 0 20px #00ff00";
                    
                    setTimeout(() => {
                        alert("🐱 SYSTEM HACKED: Secret Cat Database Unlocked!");
                        // Reset button
                        crackBtn.innerText = originalText;
                        crackBtn.style.backgroundColor = "";
                        crackBtn.style.color = "";
                        crackBtn.style.boxShadow = "";
                    }, 1000);
                }
            }, 30);
        });
    }


    // --- 6. Mobile Menu Toggle (Improved) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Logic to toggle display safely
            if (navLinks.classList.contains('active')) {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(0,0,0,0.95)';
                navLinks.style.padding = '30px';
                navLinks.style.textAlign = 'center';
                navLinks.style.borderTop = '1px solid #333';
            } else {
                navLinks.style.display = 'none';
            }
        });
    }
});