const USERS_KEY = 'wheelchair:users';
const SESSION_KEY = 'wheelchair:session';

export type User = {
  email: string;
  password: string;
  displayName: string;
  username: string;
};

function normalizeUser(user: Partial<User> & { email: string; password: string }): User {
  const emailPrefix = user.email.split('@')[0]?.toLowerCase() ?? 'user';
  return {
    email: user.email,
    password: user.password,
    displayName: user.displayName ?? emailPrefix,
    username: user.username ?? generateUsername(user.email),
  };
}

function loadUsers(): User[] {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as Array<Partial<User> & { email: string; password: string }>;
    return storedUsers.map(normalizeUser);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function generateUsername(email: string): string {
  const prefix = email.trim().split('@')[0]?.toLowerCase() ?? 'user';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomDigits}`;
}

export function registerUser(email: string, password: string, displayName: string): boolean {
  const users = loadUsers();
  if (users.some((user) => user.email === email)) return false;

  const normalizedDisplayName = displayName.trim() || email.split('@')[0];
  users.push({
    email: email.trim(),
    password,
    displayName: normalizedDisplayName,
    username: generateUsername(email),
  });
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, email.trim());
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

export function getSessionUserEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function getSessionUser(): string | null {
  const sessionEmail = getSessionUserEmail();
  if (!sessionEmail) return null;

  const users = loadUsers();
  const currentUser = users.find((user) => user.email === sessionEmail);
  return currentUser?.displayName ?? sessionEmail;
}
