// ========================================
// ST. CLAIR INN RESTAURANT - MODERN ELEGANT JAVASCRIPT
// Framer Motion Style Animations
// ========================================

// ========================================
// IMAGE FALLBACK HANDLER
// Runs immediately (not wrapped in DOMContentLoaded) so it catches
// image errors that fire while the page is still parsing.
// If a photo fails to load after a couple of retries, it is removed
// from the page entirely (its containing card/box collapses cleanly)
// instead of leaving a broken-image icon or a filler placeholder.
// ========================================
(function() {
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 400;
    // Containers that represent "this element's whole job is to show
    // this photo" - if the photo fails, remove the whole container so
    // nothing empty/broken is left behind.
    const REMOVABLE_WRAPPERS = [
        'item-image', 'party-image', 'gift-image', 'gallery-item',
        'modern-image', 'about-img-main', 'about-img-secondary',
        'sustain-video', 'parallax-bg', 'tasting-showcase-bg',
        'wine-image', 'room-image', 'team-image'
    ];

    function applyFallback(img) {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';

        // Find the closest container whose whole purpose is this image
        // and remove that; otherwise just remove the image itself.
        let target = img;
        let node = img.parentElement;
        while (node) {
            if (REMOVABLE_WRAPPERS.some(function(cls) { return node.classList.contains(cls); })) {
                target = node;
                break;
            }
            node = node.parentElement;
        }

        if (target.parentNode) {
            target.parentNode.removeChild(target);
        }
    }

    // On a slow/unstable connection a single failed request doesn't
    // necessarily mean the image is dead - retry a couple of times
    // before giving up and removing it.
    function handleError(img) {
        if (img.dataset.fallbackApplied) return;
        const attempts = parseInt(img.dataset.retryCount || '0', 10);
        if (attempts < MAX_RETRIES) {
            img.dataset.retryCount = String(attempts + 1);
            const originalSrc = img.dataset.originalSrc || img.src;
            img.dataset.originalSrc = originalSrc;
            setTimeout(function() {
                // Cache-bust so the browser makes a fresh request instead
                // of instantly re-failing on a cached error.
                const sep = originalSrc.indexOf('?') === -1 ? '?' : '&';
                img.src = originalSrc + sep + '_retry=' + (attempts + 1) + '_' + Date.now();
            }, RETRY_DELAY_MS * (attempts + 1));
        } else {
            applyFallback(img);
        }
    }

    document.addEventListener('error', function(e) {
        const target = e.target;
        if (target && target.tagName === 'IMG') {
            handleError(target);
        }
    }, true);

    // CSS background-images (parallax sections) don't fire a DOM
    // 'error' event, so test-load them separately and remove the
    // background if the photo turns out to be dead.
    function checkBackgroundImages() {
        document.querySelectorAll('[style*="background-image"]').forEach(function(el) {
            const match = el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (!match || !match[1]) return;
            const url = match[1];
            const tester = new Image();
            tester.onload = function() {};
            tester.onerror = function() {
                el.style.backgroundImage = 'none';
                el.classList.add('bg-image-removed');
            };
            tester.src = url;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkBackgroundImages);
    } else {
        checkBackgroundImages();
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // PRELOADER
    // ========================================
    const preloader = document.getElementById('preloader');
    let preloaderDismissed = false;
    function dismissPreloader() {
        if (preloaderDismissed) return;
        preloaderDismissed = true;
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        initAnimations();
    }
    window.addEventListener('load', function() {
        setTimeout(dismissPreloader, 2000);
    });
    // Safety net: if a slow/blocked network keeps some resource pending
    // and 'load' never fires promptly, don't leave the site hidden forever.
    setTimeout(dismissPreloader, 6000);

    // Prevent scroll during preload
    document.body.style.overflow = 'hidden';

    // ========================================
    // CUSTOM CURSOR
    // ========================================
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower && window.innerWidth > 768) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX - 10 + 'px';
            cursor.style.top = mouseY - 10 + 'px';
        });

        // Smooth follower animation
        function animateCursor() {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = followerX - 20 + 'px';
            cursorFollower.style.top = followerY - 20 + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .menu-item, .team-card, .party-card, .gift-card, .sustain-card, .press-card, .wine-card');
        hoverElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }

    // ========================================
    // NAVIGATION
    // ========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        this.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('.section');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // ========================================
    // FRAMER MOTION STYLE ANIMATIONS
    // ========================================
    function initAnimations() {
        const framerElements = document.querySelectorAll('[data-framer]');
        
        const framerObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(function() {
                        entry.target.classList.add('animated');
                    }, delay * 1000);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        framerElements.forEach(function(el) {
            framerObserver.observe(el);
        });
    }

    // ========================================
    // MENU TABS
    // ========================================
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuPanels = document.querySelectorAll('.menu-panel');

    menuTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-menu');
            
            // Update active tab
            menuTabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');

            // Animate panel transition
            menuPanels.forEach(function(panel) {
                panel.classList.remove('active');
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(20px)';
            });

            setTimeout(function() {
                const targetPanel = document.getElementById(target);
                targetPanel.classList.add('active');
                targetPanel.style.opacity = '1';
                targetPanel.style.transform = 'translateY(0)';
            }, 100);
        });
    });

    // ========================================
    // RESERVATION FORM - STEP BY STEP
    // ========================================
    const reservationForm = document.getElementById('reservationForm');
    const modal = document.getElementById('successModal');
    const modalClose = document.querySelector('.modal-close');
    const confirmNumber = document.getElementById('confirmNumber');
    
    // Step Navigation
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.form-step-content');
    
    let currentStep = 1;
    
    function goToStep(step) {
        // Update steps indicator
        steps.forEach(function(s, index) {
            s.classList.remove('active', 'completed');
            if (index + 1 < step) {
                s.classList.add('completed');
            } else if (index + 1 === step) {
                s.classList.add('active');
            }
        });
        
        // Update step content
        stepContents.forEach(function(content) {
            content.classList.remove('active');
        });
        document.getElementById('step' + step).classList.add('active');
        
        currentStep = step;
        
        // Update summary if on step 3
        if (step === 3) {
            updateSummary();
        }
    }
    
    nextButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            goToStep(nextStep);
        });
    });
    
    prevButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });
    
    // Guest Counter
    const guestMinus = document.getElementById('guestMinus');
    const guestPlus = document.getElementById('guestPlus');
    const guestCount = document.getElementById('guestCount');
    const quickGuests = document.querySelectorAll('.quick-guest');
    let guestNumber = 2;
    
    function updateGuestCount(num) {
        guestNumber = Math.max(1, Math.min(10, num));
        guestCount.textContent = guestNumber;
        
        // Update quick select buttons
        quickGuests.forEach(function(btn) {
            btn.classList.remove('active');
            if (parseInt(btn.getAttribute('data-guests')) === guestNumber || (guestNumber >= 8 && btn.getAttribute('data-guests') === '8')) {
                btn.classList.add('active');
            }
        });
    }
    
    if (guestMinus && guestPlus) {
        guestMinus.addEventListener('click', function() {
            updateGuestCount(guestNumber - 1);
        });
        
        guestPlus.addEventListener('click', function() {
            updateGuestCount(guestNumber + 1);
        });
    }
    
    quickGuests.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const guests = parseInt(this.getAttribute('data-guests'));
            updateGuestCount(guests);
        });
    });
    
    // Time Slots
    const timeSlots = document.querySelectorAll('.time-slot');
    const timeInput = document.getElementById('time');
    
    timeSlots.forEach(function(slot) {
        slot.addEventListener('click', function() {
            timeSlots.forEach(function(s) {
                s.classList.remove('active');
            });
            this.classList.add('active');
            timeInput.value = this.getAttribute('data-time');
        });
    });
    
    // Update Summary
    function updateSummary() {
        const dateInput = document.getElementById('date');
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        
        document.getElementById('summaryDate').textContent = dateInput.value ? new Date(dateInput.value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';
        document.getElementById('summaryTime').textContent = timeInput.value ? document.querySelector('.time-slot.active').textContent : '-';
        document.getElementById('summaryGuests').textContent = guestNumber + (guestNumber === 1 ? ' Guest' : ' Guests');
        document.getElementById('summaryName').textContent = nameInput.value || '-';
        document.getElementById('summaryPhone').textContent = phoneInput.value || '-';
        document.getElementById('summaryEmail').textContent = emailInput.value || '-';
    }
    
    // Form Submit
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Generate confirmation number
        confirmNumber.textContent = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // Show success modal with animation
        modal.classList.add('active');
        
        // Reset form and steps
        this.reset();
        goToStep(1);
        updateGuestCount(2);
        timeSlots.forEach(function(s) {
            s.classList.remove('active');
        });
    });

    // Close modal
    modalClose.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // ========================================
    // BACK TO TOP BUTTON
    // ========================================
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ========================================
    // COUNTER ANIMATION
    // ========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(function() {
            current += step;
            if (current >= target) {
                element.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    // Observe stat numbers
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(function(num) {
        statObserver.observe(num);
    });

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // PARALLAX EFFECT
    // ========================================
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        
        parallaxElements.forEach(function(el) {
            const speed = 0.3;
            const rect = el.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
            }
        });
    });

    // ========================================
    // PARTICLE EFFECTS
    // ========================================
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(201, 169, 97, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }

        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    createParticles();

    // ========================================
    // IMAGE LAZY LOADING WITH FADE
    // ========================================
    const lazyImages = document.querySelectorAll('img');

    function revealImage(img) {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }

    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                revealImage(entry.target);
                imageObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '300px' });

    lazyImages.forEach(function(img) {
        img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        // Already loaded (e.g. from cache) - show immediately
        if (img.complete && img.naturalWidth > 0) {
            revealImage(img);
            return;
        }

        img.style.opacity = '0';
        img.style.transform = 'scale(1.05)';

        // Reveal as soon as the browser actually finishes loading it,
        // don't rely solely on scroll/visibility timing.
        img.addEventListener('load', function() { revealImage(img); }, { once: true });
        // If an image fails to load, still reveal it (alt text / broken icon)
        // rather than leaving an invisible empty space forever.
        img.addEventListener('error', function() { revealImage(img); }, { once: true });

        imageObserver.observe(img);
    });

    // Safety net: images inside elements that are hidden at load time
    // (e.g. inactive menu tabs) may never trigger the observer or the
    // load event in time. Force-reveal anything still hidden shortly after.
    setTimeout(function() {
        document.querySelectorAll('img').forEach(function(img) {
            revealImage(img);
        });
    }, 1500);

    // ========================================
    // TILT EFFECT FOR CARDS
    // ========================================
    if (window.innerWidth > 768) {
        const tiltCards = document.querySelectorAll('.party-card, .team-card, .sustain-card, .gift-card');
        tiltCards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ========================================
    // MAGNETIC BUTTONS
    // ========================================
    if (window.innerWidth > 768) {
        const magneticBtns = document.querySelectorAll('.btn');
        magneticBtns.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ========================================
    // GIFT CARD PURCHASE
    // ========================================
    const giftButtons = document.querySelectorAll('.gift-card .btn');
    giftButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const card = this.closest('.gift-card');
            const amount = card.querySelector('.gift-amount').textContent;
            alert(`Gift certificate (${amount}) purchase would be processed here. This is a demo!`);
        });
    });

    // ========================================
    // NEWSLETTER FORM
    // ========================================
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value;
            if (email) {
                alert('Thank you for subscribing! You will receive our latest updates at ' + email);
                this.reset();
            }
        });
    }

    // ========================================
    // SET MINIMUM DATE FOR RESERVATION
    // ========================================
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    // ========================================
    // HERO SCROLL INDICATOR
    // ========================================
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const reservations = document.getElementById('reservations');
            if (reservations) {
                reservations.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ========================================
    // SMOOTH REVEAL ON SCROLL
    // ========================================
    function revealOnScroll() {
        const elements = document.querySelectorAll('.menu-item, .info-card, .wine-card');
        elements.forEach(function(el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // ========================================
    // TYPING EFFECT FOR HERO BADGE
    // ========================================
    const heroBadge = document.querySelector('.hero-badge span:nth-child(2)');
    if (heroBadge) {
        const text = heroBadge.textContent;
        heroBadge.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroBadge.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        }
        
        setTimeout(typeWriter, 2500);
    }

    // ========================================
    // NAVBAR LINK UNDERLINE ANIMATION
    // ========================================
    navLinks.forEach(function(link) {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'color 0.3s ease';
        });
    });

    // ========================================
    // SCROLL PROGRESS INDICATOR
    // ========================================
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
    }

    window.addEventListener('scroll', updateScrollProgress);

    // Add scroll progress bar style
    const progressStyle = document.createElement('style');
    progressStyle.textContent = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: var(--scroll-progress, 0%);
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
            z-index: 10001;
            transition: width 0.1s ease;
        }
    `;
    document.head.appendChild(progressStyle);

    // ========================================
    // SMOOTH SCROLL SNAP (OPTIONAL)
    // ========================================
    if (window.innerWidth > 768) {
        const sections = document.querySelectorAll('.section');
        let isScrolling = false;

        // Add smooth section transitions
        sections.forEach(function(section) {
            section.style.scrollSnapAlign = 'start';
        });
    }

    // ========================================
    // ANIMATED BACKGROUND GRADIENT
    // ========================================
    let gradientAngle = 0;
    function animateGradient() {
        gradientAngle = (gradientAngle + 0.5) % 360;
        document.documentElement.style.setProperty('--gradient-angle', gradientAngle + 'deg');
        requestAnimationFrame(animateGradient);
    }
    animateGradient();

    // ========================================
    // MENU ITEM HOVER SOUND (VISUAL)
    // ========================================
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(function(item) {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 40px rgba(201, 169, 97, 0.15)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });

    // ========================================
    // TEAM CARD FLIP EFFECT
    // ========================================
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const img = this.querySelector('.team-image img');
            if (img) {
                img.style.filter = 'brightness(1.1)';
            }
        });
        card.addEventListener('mouseleave', function() {
            const img = this.querySelector('.team-image img');
            if (img) {
                img.style.filter = 'brightness(1)';
            }
        });
    });

    // ========================================
    // SUSTAINABILITY CARD GLOW
    // ========================================
    const sustainCards = document.querySelectorAll('.sustain-card');
    sustainCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 60px rgba(201, 169, 97, 0.2)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });

    // ========================================
    // WINE CARD EXPAND
    // ========================================
    const wineCards = document.querySelectorAll('.wine-card');
    wineCards.forEach(function(card) {
        card.addEventListener('click', function() {
            // Toggle expanded state
            this.classList.toggle('expanded');
        });
    });

    // ========================================
    // MODAL ANIMATION
    // ========================================
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Make closeModal available globally
    window.closeModal = closeModal;

    // ========================================
    // HOTEL ROOM BOOKING SYSTEM
    // ========================================
    const roomBookingForm = document.getElementById('roomBookingForm');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const roomTypeSelect = document.getElementById('roomType');
    const roomGuestsSelect = document.getElementById('roomGuests');
    const bookingSummary = document.getElementById('bookingSummary');
    const roomBookBtns = document.querySelectorAll('.room-book-btn');
    const roomDetailsBtns = document.querySelectorAll('.room-details-btn');

    // Room prices
    const roomPrices = {
        'Deluxe Room': 299,
        'Superior Room': 349,
        'Heritage Room': 379,
        'Grand Deluxe': 449,
        'Executive Suite': 499,
        'Zen Garden Suite': 549,
        'Corner Suite': 599,
        'Honeymoon Suite': 699,
        'Royal Suite': 799,
        'Ambassador Suite': 899,
        'Royal Penthouse': 1299,
        'Skyline Penthouse': 1899
    };

    // Set minimum dates
    function setRoomDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (checkinInput) {
            checkinInput.min = today.toISOString().split('T')[0];
        }
        if (checkoutInput) {
            checkoutInput.min = tomorrow.toISOString().split('T')[0];
        }
    }
    setRoomDates();

    // Update checkout min date when checkin changes
    if (checkinInput) {
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutInput.min = nextDay.toISOString().split('T')[0];
            
            if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
                checkoutInput.value = nextDay.toISOString().split('T')[0];
            }
            updateBookingSummary();
        });
    }

    // Update summary on changes
    if (checkoutInput) {
        checkoutInput.addEventListener('change', updateBookingSummary);
    }
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', updateBookingSummary);
    }
    if (roomGuestsSelect) {
        roomGuestsSelect.addEventListener('change', updateBookingSummary);
    }

    function updateBookingSummary() {
        const checkin = checkinInput.value;
        const checkout = checkoutInput.value;
        const roomType = roomTypeSelect.value;
        const guests = roomGuestsSelect.value;

        if (checkin && checkout && roomType) {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
            const pricePerNight = roomPrices[roomType] || 0;
            const total = nights * pricePerNight;

            document.getElementById('summaryRoomType').textContent = roomType;
            document.getElementById('summaryCheckin').textContent = checkinDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            document.getElementById('summaryCheckout').textContent = checkoutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            document.getElementById('summaryNights').textContent = nights + (nights === 1 ? ' night' : ' nights');
            document.getElementById('summaryRoomGuests').textContent = guests + (guests === 1 ? ' guest' : ' guests');
            document.getElementById('summaryTotal').textContent = '$' + total.toLocaleString();

            bookingSummary.style.display = 'block';
        } else {
            bookingSummary.style.display = 'none';
        }
    }

    // Quick book buttons on room cards
    roomBookBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const roomType = this.getAttribute('data-room');
            const price = this.getAttribute('data-price');
            
            // Scroll to booking form
            const bookingForm = document.querySelector('.room-booking-wrapper');
            if (bookingForm) {
                bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Set room type
            setTimeout(function() {
                roomTypeSelect.value = roomType;
                updateBookingSummary();
            }, 500);
        });
    });

    // Room details buttons
    roomDetailsBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const roomType = this.getAttribute('data-room');
            showRoomDetails(roomType);
        });
    });

    function showRoomDetails(roomType) {
        const roomDetails = {
            'Deluxe Room': {
                desc: 'Our Deluxe Room offers a perfect blend of comfort and style. Featuring a king-size premium mattress, marble bathroom with rain shower, and panoramic city views.',
                amenities: ['King-size bed with premium linens', 'Marble bathroom with rain shower', '55" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Nespresso machine', 'In-room safe', 'Iron and ironing board', '24/7 room service'],
                size: '350 sq ft',
                view: 'City View',
                maxGuests: 2
            },
            'Superior Room': {
                desc: 'Elegantly designed room with premium bedding, marble bathroom, and panoramic river views for a truly relaxing stay.',
                amenities: ['King-size bed with premium linens', 'Marble bathroom with soaking tub', '65" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Nespresso machine', 'In-room safe', 'Premium bath amenities', 'Robe and slippers'],
                size: '400 sq ft',
                view: 'River View',
                maxGuests: 2
            },
            'Heritage Room': {
                desc: 'A tribute to timeless elegance with antique furnishings, rich fabrics, and period details blended with modern comforts.',
                amenities: ['Queen-size bed with luxury linens', 'Clawfoot bathtub', '50" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Working fireplace', 'Library corner', 'Vintage decor pieces', '24/7 room service'],
                size: '420 sq ft',
                view: 'Garden View',
                maxGuests: 2
            },
            'Grand Deluxe': {
                desc: 'Refined elegance with handcrafted furniture, art pieces, and a spa-inspired bathroom with heated floors and rain shower.',
                amenities: ['King-size bed with premium linens', 'Spa-inspired bathroom', '65" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Handcrafted furniture', 'Art collection', 'Heated bathroom floors', 'Aromatherapy amenities'],
                size: '480 sq ft',
                view: 'Park View',
                maxGuests: 2
            },
            'Executive Suite': {
                desc: 'The Executive Suite features a separate living area, perfect for business travelers or those wanting extra space. Enjoy panoramic views and premium amenities.',
                amenities: ['King-size bed with premium linens', 'Separate living area', 'Soaking bathtub', '65" Smart TV', 'Nespresso machine & mini bar', 'Work desk with ergonomic chair', 'Walk-in closet', 'Premium bath amenities'],
                size: '600 sq ft',
                view: 'Panoramic City View',
                maxGuests: 3
            },
            'Zen Garden Suite': {
                desc: 'A tranquil sanctuary with Japanese-inspired design, private zen garden, meditation space, and organic amenities.',
                amenities: ['King-size bed with organic linens', 'Japanese soaking tub', '65" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Private zen garden', 'Meditation space', 'Organic bath products', 'Bamboo furnishings'],
                size: '650 sq ft',
                view: 'Garden View',
                maxGuests: 2
            },
            'Corner Suite': {
                desc: 'Expansive corner suite with floor-to-ceiling windows, dual panoramic views, and a private dining area for intimate meals.',
                amenities: ['King-size bed with luxury linens', 'Freestanding bathtub', '75" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Private dining area', 'Floor-to-ceiling windows', 'Butler pantry', 'Premium toiletries'],
                size: '750 sq ft',
                view: 'Dual Panoramic View',
                maxGuests: 3
            },
            'Honeymoon Suite': {
                desc: 'A romantic retreat with rose petal turndown, champagne on arrival, and a private balcony overlooking the city skyline.',
                amenities: ['King-size bed with silk linens', 'Bubble bathtub', '65" Smart TV with streaming', 'Complimentary high-speed WiFi', 'Private balcony', 'Rose petal turndown', 'Champagne on arrival', 'Couples spa access'],
                size: '700 sq ft',
                view: 'Skyline View',
                maxGuests: 2
            },
            'Royal Suite': {
                desc: 'Indulge in luxury with our Royal Suite, featuring elegant furnishings, a master bedroom, private terrace, and dedicated butler service.',
                amenities: ['Master bedroom with king bed', 'Private terrace', 'Jacuzzi bathtub', 'Butler service', 'Premium wine collection', 'Dining area', 'Luxury bath products', 'Priority restaurant reservations'],
                size: '900 sq ft',
                view: 'Skyline View',
                maxGuests: 3
            },
            'Ambassador Suite': {
                desc: 'Sophisticated suite with separate entertainment area, state-of-the-art technology, and 24-hour private concierge service.',
                amenities: ['King-size bed with premium linens', 'Separate entertainment area', 'Steam shower', '75" Smart TV with Bose sound', '24-hour private concierge', 'Premium bar', 'Work office space', 'Luxury bath amenities'],
                size: '1,000 sq ft',
                view: 'Corner Panoramic View',
                maxGuests: 3
            },
            'Royal Penthouse': {
                desc: 'Our finest accommodation featuring two bedrooms, a private rooftop terrace, dedicated chef service, and breathtaking 360-degree views of the city.',
                amenities: ['Two king-size bedrooms', 'Private rooftop terrace', 'Dedicated chef service', 'Private elevator access', 'Premium wine cellar access', 'Two full marble bathrooms', 'Living and dining areas', 'Exclusive check-in'],
                size: '1,500 sq ft',
                view: '360° City Views',
                maxGuests: 4
            },
            'Skyline Penthouse': {
                desc: 'The pinnacle of luxury living with private pool, helipad access, art gallery, and a dedicated team of staff for ultimate privacy and comfort.',
                amenities: ['Three king-size bedrooms', 'Private rooftop pool', 'Helipad access', 'Private art gallery', 'Full dedicated staff', 'Three marble bathrooms', 'Private cinema room', 'Wine tasting room'],
                size: '2,500 sq ft',
                view: '360° Panoramic Views',
                maxGuests: 6
            }
        };

        const room = roomDetails[roomType];
        if (!room) return;

        // Create modal
        const modalHTML = `
            <div class="room-booking-modal active" id="roomDetailModal">
                <div class="room-modal-content">
                    <button class="room-modal-close" onclick="this.closest('.room-booking-modal').remove()">&times;</button>
                    <div class="room-modal-icon"><i class="fas fa-bed"></i></div>
                    <h3>${roomType}</h3>
                    <p>${room.desc}</p>
                    <div class="room-modal-details">
                        <div class="detail-row">
                            <span><i class="fas fa-expand"></i> Size</span>
                            <span>${room.size}</span>
                        </div>
                        <div class="detail-row">
                            <span><i class="fas fa-city"></i> View</span>
                            <span>${room.view}</span>
                        </div>
                        <div class="detail-row">
                            <span><i class="fas fa-users"></i> Max Guests</span>
                            <span>${room.maxGuests} guests</span>
                        </div>
                        <div class="detail-row">
                            <span><i class="fas fa-tag"></i> Price</span>
                            <span>$${roomPrices[roomType]}/night</span>
                        </div>
                    </div>
                    <div style="text-align: left; margin-bottom: 25px;">
                        <h4 style="font-family: var(--font-primary); color: var(--white); margin-bottom: 15px; font-size: 1rem;">Room Amenities</h4>
                        <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                            ${room.amenities.map(function(a) { return '<li style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--gray-light);"><i class="fas fa-check" style="color: var(--primary); font-size: 0.7rem;"></i>' + a + '</li>'; }).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="document.getElementById('roomDetailModal').remove(); document.getElementById('roomType').value='${roomType}'; updateBookingSummary(); document.querySelector('.room-booking-wrapper').scrollIntoView({behavior:'smooth', block:'center'});">
                        <i class="fas fa-calendar-check"></i> Book This Room
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Room booking form submission
    if (roomBookingForm) {
        roomBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const checkin = checkinInput.value;
            const checkout = checkoutInput.value;
            const roomType = roomTypeSelect.value;
            const guests = roomGuestsSelect.value;
            const name = document.getElementById('roomName').value;
            const email = document.getElementById('roomEmail').value;
            const phone = document.getElementById('roomPhone').value;
            const terms = document.getElementById('roomTerms').checked;

            if (!terms) {
                alert('Please agree to the terms and conditions.');
                return;
            }

            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
            const total = nights * (roomPrices[roomType] || 0);
            const confirmNum = Math.random().toString(36).substr(2, 8).toUpperCase();

            // Show success modal
            const successHTML = `
                <div class="room-booking-modal active" id="roomSuccessModal">
                    <div class="room-modal-content">
                        <button class="room-modal-close" onclick="this.closest('.room-booking-modal').remove()">&times;</button>
                        <div class="room-modal-icon"><i class="fas fa-check-circle"></i></div>
                        <h3>Room Booked Successfully!</h3>
                        <p>Thank you, ${name}! Your reservation has been confirmed. A confirmation email will be sent to ${email}.</p>
                        <div class="room-modal-details">
                            <div class="detail-row">
                                <span>Confirmation #</span>
                                <span>SCI-${confirmNum}</span>
                            </div>
                            <div class="detail-row">
                                <span>Room</span>
                                <span>${roomType}</span>
                            </div>
                            <div class="detail-row">
                                <span>Check-In</span>
                                <span>${checkinDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div class="detail-row">
                                <span>Check-Out</span>
                                <span>${checkoutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div class="detail-row">
                                <span>Nights</span>
                                <span>${nights}</span>
                            </div>
                            <div class="detail-row">
                                <span>Guests</span>
                                <span>${guests}</span>
                            </div>
                            <div class="detail-row detail-total">
                                <span>Total Amount</span>
                                <span>$${total.toLocaleString()}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-full" onclick="this.closest('.room-booking-modal').remove();">
                            <i class="fas fa-check"></i> Done
                        </button>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', successHTML);
            
            // Reset form
            this.reset();
            bookingSummary.style.display = 'none';
            setRoomDates();
        });
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Close modal on Escape
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
        
        // Close mobile menu on Escape
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(function() {
            // Scroll-based animations here
        });
    });

    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Handle resize
        }, 250);
    });

    // ========================================
    // GALLERY LIGHTBOX
    // ========================================
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('galleryLightbox');

    if (galleryItems.length && lightbox) {
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        let currentIndex = 0;

        function showGalleryImage(index) {
            currentIndex = (index + galleryItems.length) % galleryItems.length;
            const item = galleryItems[currentIndex];
            const img = item.querySelector('img');
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightboxCaption.textContent = item.getAttribute('data-caption') || img.alt;
        }

        function openLightbox(index) {
            showGalleryImage(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        galleryItems.forEach(function(item, index) {
            item.addEventListener('click', function() {
                openLightbox(index);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', function() {
            showGalleryImage(currentIndex - 1);
        });
        lightboxNext.addEventListener('click', function() {
            showGalleryImage(currentIndex + 1);
        });

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showGalleryImage(currentIndex - 1);
            if (e.key === 'ArrowRight') showGalleryImage(currentIndex + 1);
        });
    }

    console.log('🍽️ Gwfin Restaurant - Enhanced Experience Loaded');
});
