const AUTH_STORAGE_KEY = 'campusParcelAuth';

function saveAuthSession(data) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function getAuthSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isAdminSession() {
  const session = getAuthSession();
  return Boolean(session && session.user && session.user.role === 'admin');
}

function canAccessAdminDashboard() {
  return isAdminSession();
}

function setupAuthStatus() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) {
    return;
  }

  const existingAuthBox = document.getElementById('authStatusBox');
  if (existingAuthBox) {
    existingAuthBox.remove();
  }

  const session = getAuthSession();
  if (!session || !session.user) {
    return;
  }

  const authBox = document.createElement('div');
  authBox.id = 'authStatusBox';
  authBox.className = 'auth-status-box';
  authBox.innerHTML = `
    <span class="auth-user">👤 ${session.user.fullName} (${session.user.role})</span>
    <button id="logoutBtn" class="btn btn-secondary nav-action" type="button">Logout</button>
  `;

  navLinks.appendChild(authBox);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuthSession();
      window.location.reload();
    });
  }
}

function setupAdminAuthForms() {
  const authWrapper = document.getElementById('adminAuthWrapper');
  const dashboardWrapper = document.getElementById('adminDashboardWrapper');
  const loginForm = document.getElementById('adminLoginForm');
  const loginResult = document.getElementById('adminLoginResult');
  const authHint = document.getElementById('adminAuthHint');

  if (!authWrapper || !dashboardWrapper || !loginForm || !loginResult) {
    return;
  }

  const loadAdminHint = async () => {
    if (!authHint) {
      return;
    }

    try {
      const response = await fetch('/api/auth/admin-status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load admin status');
      }

      if (Number(data.adminCount) === 0) {
        authHint.style.display = 'block';
        authHint.innerHTML = 'No admin account found. Create one at <a href="admin-register.html" class="inline-link">admin-register.html</a> then login here.';
      } else if (data.canRegister) {
        authHint.style.display = 'block';
        authHint.innerHTML = 'Need another admin? Use <a href="admin-register.html" class="inline-link">admin-register.html</a>.';
      } else {
        authHint.style.display = 'none';
      }
    } catch (error) {
      authHint.style.display = 'block';
      authHint.innerHTML = 'If login fails and no admin exists, register at <a href="admin-register.html" class="inline-link">admin-register.html</a>.';
    }
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminLoginEmail').value.trim();
    const password = document.getElementById('adminLoginPassword').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.user || data.user.role !== 'admin') {
        throw new Error('Only admin account can access this dashboard');
      }

      saveAuthSession({
        token: data.token,
        user: data.user,
        loginAt: new Date().toISOString()
      });

      loginResult.className = 'result-box success';
      loginResult.innerHTML = `<h3>✅ Welcome, ${data.user.fullName}</h3><p>Loading dashboard...</p>`;
      loginResult.style.display = 'block';

      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (error) {
      loginResult.className = 'result-box error';
      loginResult.innerHTML = `<h3>❌ Login Failed</h3><p>${error.message}</p>`;
      loginResult.style.display = 'block';
    }
  });

  if (canAccessAdminDashboard()) {
    authWrapper.style.display = 'none';
    dashboardWrapper.style.display = 'block';
  } else {
    authWrapper.style.display = 'block';
    dashboardWrapper.style.display = 'none';
    loadAdminHint();
  }
}

function setupAdminRegisterPage() {
  const registerForm = document.getElementById('adminStandaloneRegisterForm');
  const registerResult = document.getElementById('adminStandaloneRegisterResult');

  if (!registerForm || !registerResult) {
    return;
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('adminStandaloneName').value.trim();
    const email = document.getElementById('adminStandaloneEmail').value.trim();
    const password = document.getElementById('adminStandalonePassword').value;
    const confirmPassword = document.getElementById('adminStandaloneConfirmPassword').value;

    if (password !== confirmPassword) {
      registerResult.className = 'result-box error';
      registerResult.innerHTML = '<h3>❌ Registration Failed</h3><p>Passwords do not match.</p>';
      registerResult.style.display = 'block';
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role: 'admin',
          studentId: null
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      saveAuthSession({
        token: `admin-register-${Date.now()}`,
        user: data.user,
        loginAt: new Date().toISOString()
      });

      registerResult.className = 'result-box success';
      registerResult.innerHTML = '<h3>✅ Admin Registered</h3><p>Redirecting to admin dashboard...</p>';
      registerResult.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 700);
    } catch (error) {
      registerResult.className = 'result-box error';
      registerResult.innerHTML = `<h3>❌ Registration Failed</h3><p>${error.message}</p>`;
      registerResult.style.display = 'block';
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupAuthStatus();
  setupAdminAuthForms();
  setupAdminRegisterPage();
});
