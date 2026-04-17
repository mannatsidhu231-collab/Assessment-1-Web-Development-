/* ===================================================
   NomadRoute — Interactive Effects & Logic
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // =============== CUSTOM CURSOR — COMPASS WAYPOINT ===============
  const cursorWrap = document.getElementById('cursorWrapper');
  const trailCanvas = document.getElementById('cursorTrail');
  const trailCtx = trailCanvas ? trailCanvas.getContext('2d') : null;

  let mx = -100, my = -100;
  let prevMx = -100, prevMy = -100;
  // Use pointer: fine to detect devices with a precise pointer (mouse/trackpad)
  // This works correctly on Windows laptops with touchscreens
  const hasFineCursor = window.matchMedia('(pointer: fine)').matches;
  const isTouchDevice = !hasFineCursor;

  // Trail particle pool
  const trails = [];
  const MAX_TRAILS = 40;

  function resizeTrailCanvas() {
    if (!trailCanvas) return;
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }

  if (!isTouchDevice && cursorWrap && trailCanvas) {
    // Activate custom cursor — tells CSS to hide the native one
    document.body.classList.add('custom-cursor-active');
    resizeTrailCanvas();
    window.addEventListener('resize', resizeTrailCanvas);

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!cursorWrap.classList.contains('cursor-active')) {
        cursorWrap.classList.add('cursor-active');
      }
    });

    // Spawn trail particles based on distance traveled
    function spawnTrail() {
      const dx = mx - prevMx;
      const dy = my - prevMy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 12) {
        trails.push({
          x: mx,
          y: my,
          life: 1,
          size: 2 + Math.random() * 1.5
        });
        if (trails.length > MAX_TRAILS) trails.shift();
        prevMx = mx;
        prevMy = my;
      }
    }

    // Render loop — cursor + trail
    function renderCursor() {
      // Position compass SVG instantly (no lerp = zero lag)
      cursorWrap.style.transform = `translate3d(${mx - 24}px, ${my - 24}px, 0)`;

      // Draw trail
      spawnTrail();
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.025;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        const alpha = t.life * 0.5;
        trailCtx.beginPath();
        trailCtx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
        trailCtx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        trailCtx.fill();

        // Tiny crosshair at each trail point
        const s = t.size * 1.5 * t.life;
        trailCtx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.5})`;
        trailCtx.lineWidth = 0.5;
        trailCtx.beginPath();
        trailCtx.moveTo(t.x - s, t.y);
        trailCtx.lineTo(t.x + s, t.y);
        trailCtx.moveTo(t.x, t.y - s);
        trailCtx.lineTo(t.x, t.y + s);
        trailCtx.stroke();
      }

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .service-card, .testimonial-card, .step-content, .stat-card, input, select, textarea');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorWrap.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorWrap.classList.remove('hovering'));
    });
  }

  // =============== NAVBAR SCROLL ===============
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('.section, .hero');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll);

  // =============== MOBILE NAV TOGGLE ===============
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // =============== HERO PARTICLES ===============
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = (60 + Math.random() * 40) + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (5 + Math.random() * 6) + 's';
      const hue = Math.random() > 0.5 ? '24, 100%, 54%' : '187, 96%, 47%';
      particle.style.background = `hsl(${hue})`;
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
  }

  // =============== SCROLL REVEAL ===============
  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // =============== PARALLAX SCROLL ===============
  const parallaxSections = document.querySelectorAll('.parallax-section');

  function handleParallax() {
    const scrollY = window.scrollY;
    parallaxSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const offset = (scrollY - sectionTop) * 0.15;

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Apply a subtle Y-translation to the background layers
        const bgLayers = section.querySelector('.hero-bg-layers, .stats-bg');
        if (bgLayers) {
          bgLayers.style.transform = `translateY(${offset}px)`;
        }

        // Apply subtle depth offset to content
        const content = section.querySelector('.hero-content, .stats-grid');
        if (content) {
          content.style.transform = `translateY(${offset * 0.3}px)`;
        }
      }
    });
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // =============== 3D TILT EFFECT ===============
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (isTouchDevice) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  // =============== COUNT-UP STATS ===============
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsCounted = false;

  function countUp(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 2000;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    }

    requestAnimationFrame(updateCount);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach((el, i) => {
          setTimeout(() => countUp(el), i * 150);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  // =============== CONTACT FORM ===============
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formWrap = contactForm.closest('.contact-form-wrap');
      formWrap.innerHTML = `
        <div class="form-success">
          <div class="form-success-icon">✓</div>
          <h3>Mission Brief Received</h3>
          <p>Our logistics team will reach out within 24 hours to discuss your expedition.</p>
        </div>
      `;
    });
  }

  // =============== SMOOTH SCROLL FOR ANCHOR LINKS ===============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =============== ACTIVE NAV LINK HIGHLIGHT ===============
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // =============== NORMI CHATBOT ===============
  const normiFab = document.getElementById('normiFab');
  const normiPopup = document.getElementById('normiPopup');
  const normiGreeting = document.getElementById('normiGreeting');
  const normiGreetingClose = document.getElementById('normiGreetingClose');

  if (normiFab && normiPopup) {
    normiFab.addEventListener('click', () => {
      const isOpen = normiPopup.classList.toggle('open');
      normiFab.classList.toggle('open', isOpen);

      // Hide greeting when chat opens
      if (isOpen && normiGreeting) {
        normiGreeting.classList.add('hidden');
      }
    });
  }

  // Close greeting tooltip
  if (normiGreetingClose && normiGreeting) {
    normiGreetingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      normiGreeting.classList.add('hidden');
    });
  }

  // Auto-hide greeting after 8 seconds
  if (normiGreeting) {
    setTimeout(() => {
      if (!normiGreeting.classList.contains('hidden')) {
        normiGreeting.classList.add('hidden');
      }
    }, 8000);
  }
});
