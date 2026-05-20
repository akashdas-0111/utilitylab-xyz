/**
 * UtilityLab.xyz - Main JS Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  highlightActiveLink();
  initEmailForm();
});

/**
 * Initializes the mobile hamburger menu toggle.
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = toggleBtn.classList.toggle('active');
    mainNav.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isActive);
  });

  // Close menu when clicking outside of the header
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('active') && !e.target.closest('.header-container')) {
      toggleBtn.classList.remove('active');
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Handle escape key to close menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('active')) {
      toggleBtn.classList.remove('active');
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.focus();
    }
  });
}

/**
 * Highlights the nav link matching the current URL.
 */
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Exact match or matches directory
    if (href === currentPath || 
        (href !== '/' && currentPath.startsWith(href)) ||
        (href === '/' && (currentPath === '' || currentPath === '/index.html' || currentPath === '/utilitylab-xyz/index.html'))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Handles the email capture subscription submission.
 */
function initEmailForm() {
  const form = document.getElementById('email-toolkit-form');
  const container = document.getElementById('email-form-container');

  if (!form || !container) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.email-input');
    
    if (input && input.value.trim() !== '') {
      // Perform JS DOM swap
      container.innerHTML = '<div class="email-success-msg" role="status" aria-live="polite">🎉 Check your inbox!</div>';
    }
  });
}
