import type { UserAccount } from "@/shared/types/auth";

const USERS_KEY = "tdc_users";
const SESSION_KEY = "tdc_session_user_id";

const loadUsers = (): UserAccount[] => {
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as UserAccount[];
  } catch {
    window.localStorage.removeItem(USERS_KEY);
    return [];
  }
};

const saveUsers = (users: UserAccount[]): void => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): UserAccount | null => {
  const sessionUserId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionUserId) return null;

  const user = loadUsers().find((item) => item.id === sessionUserId);
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }

  return user;
};

export const registerUser = (email: string, password: string): { user?: UserAccount; error?: string } => {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { error: "Пользователь с таким email уже существует." };
  }

  const user: UserAccount = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, user];
  saveUsers(updated);
  window.localStorage.setItem(SESSION_KEY, user.id);

  return { user };
};

export const loginUser = (email: string, password: string): { user?: UserAccount; error?: string } => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = loadUsers().find((item) => item.email === normalizedEmail && item.password === password);
  if (!user) {
    return { error: "Неверный email или пароль." };
  }

  window.localStorage.setItem(SESSION_KEY, user.id);
  return { user };
};

export const logoutUser = (): void => {
  window.localStorage.removeItem(SESSION_KEY);
};
