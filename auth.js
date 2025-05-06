// ==== AUTH LOGIC ====
(function() {
  // Helper: get/set users in localStorage
  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
  }
  function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  function setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
  }
  function getCurrentUser() {
    return localStorage.getItem('currentUser');
  }
  function clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // DOM elements
  const authModal = document.getElementById('auth-modal');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const userInfo = document.getElementById('user-info');
  const userGreeting = document.getElementById('user-greeting');
  const logoutBtn = document.getElementById('logout-btn');
  const tabContainer = document.querySelector('.tab-container');
  const contentContainer = document.querySelector('.content-container');

  // Tab switching in modal
  loginTab.onclick = () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    loginError.textContent = '';
    registerError.textContent = '';
  };
  registerTab.onclick = () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    loginError.textContent = '';
    registerError.textContent = '';
  };

  // Hide all tabs/content until login
  function setTabsEnabled(enabled) {
    tabContainer.style.pointerEvents = enabled ? '' : 'none';
    tabContainer.style.opacity = enabled ? '1' : '0.5';
    contentContainer.style.pointerEvents = enabled ? '' : 'none';
    contentContainer.style.opacity = enabled ? '1' : '0.3';
  }

  // Show/hide modal
  function showAuthModal() {
    authModal.style.display = 'flex';
    setTabsEnabled(false);
  }
  function hideAuthModal() {
    authModal.style.display = 'none';
    setTabsEnabled(true);
  }

  // Show user info
  function showUserInfo(username) {
    userGreeting.textContent = `Xin chào, ${username}!`;
    userInfo.style.display = '';
  }
  function hideUserInfo() {
    userInfo.style.display = 'none';
  }

  // Login logic
  loginForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    if (!users[username] || users[username].password !== password) {
      loginError.textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
      return;
    }
    setCurrentUser(username);
    hideAuthModal();
    showUserInfo(username);
    loginForm.reset();
    loginError.textContent = '';
  };

  // Register logic
  registerForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const password2 = document.getElementById('register-password2').value;
    const users = getUsers();
    if (!username.match(/^[a-zA-Z0-9_]{3,16}$/)) {
      registerError.textContent = 'Tên đăng nhập 3-16 ký tự, không dấu, không khoảng trắng!';
      return;
    }
    if (users[username]) {
      registerError.textContent = 'Tên đăng nhập đã tồn tại!';
      return;
    }
    if (password.length < 4) {
      registerError.textContent = 'Mật khẩu phải từ 4 ký tự trở lên!';
      return;
    }
    if (password !== password2) {
      registerError.textContent = 'Mật khẩu nhập lại không khớp!';
      return;
    }
    users[username] = { password };
    setUsers(users);
    setCurrentUser(username);
    hideAuthModal();
    showUserInfo(username);
    registerForm.reset();
    registerError.textContent = '';
  };

  // Logout
  logoutBtn.onclick = function() {
    clearCurrentUser();
    hideUserInfo();
    showAuthModal();
  };

  // On load: check login
  function checkAuth() {
    const username = getCurrentUser();
    if (username && getUsers()[username]) {
      hideAuthModal();
      showUserInfo(username);
      setTabsEnabled(true);
    } else {
      showAuthModal();
      hideUserInfo();
      setTabsEnabled(false);
    }
  }

  // Prevent tab/content interaction if not logged in
  setTabsEnabled(false);
  checkAuth();

  // Prevent F5/refresh from showing modal if already logged in
  window.addEventListener('storage', checkAuth);
})();
