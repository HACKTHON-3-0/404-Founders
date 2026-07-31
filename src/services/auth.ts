const USERS_KEY = 'wheelchair:users';
const SESSION_KEY = 'wheelchair:session';

export type User = {
  email: string;
  password: string;
};

function loadUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(email: string, password: string): boolean {
  const users = loadUsers();
  if (users.some((user) => user.email === email)) return false;
  users.push({ email, password });
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, email);
  return true;
}

export function loginUser(email: string, password: string): boolean {
  const users = loadUsers();
  const valid = users.some((user) => user.email === email && user.password === password);
  if (valid) {
    localStorage.setItem(SESSION_KEY, email);
  }
  return valid;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser(): string | null {
  return localStorage.getItem(SESSION_KEY);
}
