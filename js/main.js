/* ==========================================================================
   BIBLIOTECA DE EXERCÍCIOS FUNCIONAIS V1 — MAIN JAVASCRIPT
   FAQ Accordion, CTA Event Tracking & Smooth Interactivity
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initCtaTracking();
  initSmoothScroll();
  initTestiCarousel();
});

/**
 * FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-button');

  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const isOpen = faqItem.classList.contains('active');

      // Close all other active FAQ items
      document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const btn = item.querySelector('.faq-button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current FAQ item
      faqItem.classList.toggle('active', !isOpen);
      button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
}

/**
 * CTA Click Tracking Event Handler
 */
function initCtaTracking() {
  const trackingElements = document.querySelectorAll('[data-tracking]');

  trackingElements.forEach(el => {
    el.addEventListener('click', (e) => {
      const trackingId = el.getAttribute('data-tracking');
      const href = el.getAttribute('href');

      // Console tracking log for analytics debugging
      console.log(`[LP Tracking Event]: ${trackingId}`, {
        destination: href,
        timestamp: new Date().toISOString()
      });

      // Meta Pixel / Google Tag Manager Event Dispatcher
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'LP_CTA_Click', { cta_id: trackingId });
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_click', {
          'event_category': 'conversion',
          'event_label': trackingId
        });
      }
    });
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Dobra 07 — Testimonial Carousel (Infinite Loop & Touch/Finger Drag Support)
 */
function initTestiCarousel() {
  const track = document.getElementById('testi-track');
  const container = document.getElementById('testi-track-container');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  const dotsContainer = document.getElementById('testi-dots');

  if (!track || !container) return;

  const slides = Array.from(track.children);
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;

  // Build Pagination Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir para depoimento ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
      dot.setAttribute('aria-current', idx === currentIndex ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    // Infinite Loop Logic: wraps around seamlessly
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    prevTranslate = -currentIndex * container.clientWidth;
    updateDots();
  }

  // Arrow Click Event Handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // Touch Swipe & Drag Handlers
  function getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  function touchStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    track.style.transition = 'none';
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startX;
    const containerWidth = container.clientWidth;
    const movePercent = (diff / containerWidth) * 100;
    const targetTranslate = -(currentIndex * 100) + movePercent;
    track.style.transform = `translateX(${targetTranslate}%)`;
  }

  function touchEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    const endX = event.type.includes('mouse') ? event.clientX : (event.changedTouches ? event.changedTouches[0].clientX : startX);
    const movedBy = endX - startX;

    // Swipe Threshold of 40px
    if (movedBy < -40) {
      goToSlide(currentIndex + 1);
    } else if (movedBy > 40) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex);
    }
  }

  // Touch Events
  container.addEventListener('touchstart', touchStart, { passive: true });
  container.addEventListener('touchmove', touchMove, { passive: true });
  container.addEventListener('touchend', touchEnd);

  // Mouse Drag Events for Desktop Testing
  container.addEventListener('mousedown', touchStart);
  container.addEventListener('mousemove', touchMove);
  container.addEventListener('mouseup', touchEnd);
  container.addEventListener('mouseleave', () => {
    if (isDragging) touchEnd({ clientX: startX });
  });

  // Keyboard Navigation (Left / Right Arrow Keys)
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
    }
  });

  // Initialize First Slide position
  goToSlide(0);
}

