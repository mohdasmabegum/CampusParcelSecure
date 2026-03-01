// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Theme handling
const THEME_KEY = 'campusParcelTheme';

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    return savedTheme;
  }
  return 'dark';
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
}

function setupHeaderUtilities() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) {
    return;
  }

  const existingThemeToggle = document.getElementById('themeToggle');
  const existingInstallButton = document.getElementById('installButton');

  if (!existingThemeToggle) {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'btn btn-secondary nav-action';
    themeToggle.type = 'button';
    navLinks.appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  if (!existingInstallButton) {
    const installButton = document.createElement('button');
    installButton.id = 'installButton';
    installButton.className = 'btn btn-secondary nav-action install-btn';
    installButton.type = 'button';
    installButton.textContent = '⬇️ Install App';
    installButton.style.display = 'none';
    navLinks.appendChild(installButton);
  }

  applyTheme(getPreferredTheme());
}

function animateCounter(element, nextValue) {
  const startValue = Number(element.textContent) || 0;
  const duration = 500;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const currentValue = Math.round(startValue + (nextValue - startValue) * progress);
    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

async function loadHomeStats() {
  const totalEl = document.getElementById('homeTotal');
  const pendingEl = document.getElementById('homePending');
  const completedEl = document.getElementById('homeCompleted');
  const statusEl = document.getElementById('statsStatus');

  if (!totalEl || !pendingEl || !completedEl) {
    return;
  }

  try {
    const response = await fetch('/api/stats');
    if (!response.ok) {
      throw new Error('Unable to fetch stats');
    }

    const stats = await response.json();
    animateCounter(totalEl, Number(stats.total) || 0);
    animateCounter(pendingEl, Number(stats.pending) || 0);
    animateCounter(completedEl, Number(stats.completed) || 0);

    if (statusEl) {
      statusEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = `Could not load stats: ${error.message}`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setupHeaderUtilities();

  const refreshStatsBtn = document.getElementById('refreshStatsBtn');
  if (refreshStatsBtn) {
    refreshStatsBtn.addEventListener('click', loadHomeStats);
    loadHomeStats();
  }
});

// Install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button/banner if you want to add one
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create install button if it doesn't exist
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});

// Detect if app is running in standalone mode
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
  console.log('Running as installed PWA');
}
