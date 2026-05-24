/* ============== PASTA TD SAVE SYSTEM ============== */
// Username/password is stored locally with a simple hash for the 'login' flow.
// Guest mode = stored under a 'guest' profile in localStorage.

const SAVE_KEY_PREFIX = 'pastaTD:v1:';
const USERS_KEY = 'pastaTD:users:v1';
const SESSION_KEY = 'pastaTD:session:v1';

// Simple hash (not secure - this is a casual local game)
function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(36);
}

const SaveSystem = {
  currentUser: null,  // 'guest' or username

  loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    } catch (e) { return {}; }
  },
  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  register(username, password) {
    username = (username || '').trim();
    if (!username || username.length < 2) return { ok: false, msg: 'Username must be at least 2 characters' };
    if (!password || password.length < 3) return { ok: false, msg: 'Password too short (min 3 chars)' };
    if (username.toLowerCase() === 'guest') return { ok: false, msg: 'That name is reserved!' };
    const users = this.loadUsers();
    if (users[username]) return { ok: false, msg: 'Username already taken' };
    users[username] = { hash: simpleHash(password + ':' + username), created: Date.now() };
    this.saveUsers(users);
    return { ok: true, msg: 'Welcome to the kitchen, ' + username + '!' };
  },

  login(username, password) {
    username = (username || '').trim();
    const users = this.loadUsers();
    if (!users[username]) return { ok: false, msg: 'No such chef. Register first!' };
    if (users[username].hash !== simpleHash(password + ':' + username)) {
      return { ok: false, msg: 'Wrong password!' };
    }
    return { ok: true, msg: 'Welcome back, ' + username + '!' };
  },

  setSession(username) {
    this.currentUser = username;
    try { localStorage.setItem(SESSION_KEY, username); } catch (e) {}
  },
  clearSession() {
    this.currentUser = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  },
  getSession() {
    try { return localStorage.getItem(SESSION_KEY); } catch (e) { return null; }
  },

  load() {
    if (!this.currentUser) return makeDefaultSave();
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + this.currentUser);
      if (!raw) return makeDefaultSave();
      const data = JSON.parse(raw);
      // Migration / defaults
      const def = makeDefaultSave();
      return Object.assign(def, data, { username: this.currentUser });
    } catch (e) {
      console.warn('Save load failed', e);
      return makeDefaultSave();
    }
  },
  save(data) {
    if (!this.currentUser) return;
    data.username = this.currentUser;
    try {
      localStorage.setItem(SAVE_KEY_PREFIX + this.currentUser, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed', e);
      return false;
    }
  }
};
