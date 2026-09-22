import { AuthUser } from '../types';

export const AUTH_USERS_KEY = 'semillas_auth_users_v1';
export const AUTH_SESSION_KEY = 'semillas_auth_session_v1';
export const AUTH_REQUIRED_KEY = 'semillas_auth_required_v1';
export const MAX_ALLOWED_ACCOUNTS = 2;
const SALT = 'semillas_del_reino_2026_salt_';

export const DEFAULT_OWNER_USER: AuthUser = {
  id: 'owner_principal',
  username: 'propietario',
  name: 'Dirección General (Propietario)',
  role: 'owner',
  passwordHash: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

/**
 * Checks if mandatory login screen is enabled.
 * Defaults to false so user has full, immediate access without blockers or data loss.
 */
export function isAuthRequired(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_REQUIRED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

/**
 * Enables or disables mandatory login screen on app start
 */
export function setAuthRequired(required: boolean): void {
  try {
    localStorage.setItem(AUTH_REQUIRED_KEY, required ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving auth requirement', err);
  }
}

/**
 * Generates a SHA-256 hash for secure client-side password verification
 */
export async function hashPassword(password: string): Promise<string> {
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback simple hash if WebCrypto is unavailable
    let hash = 0;
    const str = SALT + password;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const buffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies if entered password matches the stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}

/**
 * Retrieves all registered authorized users (max 2)
 */
export function getStoredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves registered users to localStorage
 */
export function saveStoredUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users', err);
  }
}

/**
 * Gets currently authenticated user from active session
 */
export function getCurrentSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.id) {
        const users = getStoredUsers();
        const found = users.find((u) => u.id === session.id);
        return found || session;
      }
    }

    // If login is not strictly enforced, allow direct owner access without friction
    if (!isAuthRequired()) {
      const users = getStoredUsers();
      if (users.length > 0) {
        return users[0];
      }
      return DEFAULT_OWNER_USER;
    }

    return null;
  } catch {
    return isAuthRequired() ? null : DEFAULT_OWNER_USER;
  }
}

/**
 * Saves active session or null on logout
 */
export function saveCurrentSession(user: AuthUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Error saving session', err);
  }
}

/**
 * Authenticates user credentials
 */
export async function authenticate(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const users = getStoredUsers();
  const trimmed = usernameOrEmail.trim().toLowerCase();

  const user = users.find(
    (u) => u.username.toLowerCase() === trimmed
  );

  if (!user) {
    return {
      success: false,
      error: 'Usuario o correo no autorizado en el sistema.',
    };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return {
      success: false,
      error: 'Contraseña incorrecta. Verifica e intenta nuevamente.',
    };
  }

  // Update last login
  const updatedUser: AuthUser = {
    ...user,
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredUsers(updatedUsers);
  saveCurrentSession(updatedUser);

  return {
    success: true,
    user: updatedUser,
  };
}

/**
 * Creates the Primary Owner / Director account (first account)
 */
export async function createOwnerAccount(
  username: string,
  name: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const users = getStoredUsers();
  if (users.length >= MAX_ALLOWED_ACCOUNTS) {
    return {
      success: false,
      error: `Límite máximo de ${MAX_ALLOWED_ACCOUNTS} cuentas alcanzado. No es posible crear más cuentas.`,
    };
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (!trimmedUsername || trimmedUsername.length < 3) {
    return {
      success: false,
      error: 'Ingresa un usuario o correo válido (mínimo 3 caracteres).',
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres para mayor seguridad.',
    };
  }

  const hash = await hashPassword(password);
  const ownerUser: AuthUser = {
    id: 'owner_' + Date.now(),
    username: trimmedUsername,
    name: name.trim() || 'Propietario / Director',
    role: 'owner',
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  const newUsers = [...users, ownerUser];
  saveStoredUsers(newUsers);
  saveCurrentSession(ownerUser);

  return {
    success: true,
    user: ownerUser,
  };
}

/**
 * Creates the Second authorized account (e.g. Co-director, coordinator)
 */
export async function createSecondAccount(
  username: string,
  name: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const users = getStoredUsers();
  if (users.length >= MAX_ALLOWED_ACCOUNTS) {
    return {
      success: false,
      error: `Límite de seguridad alcanzado: Solo se permiten ${MAX_ALLOWED_ACCOUNTS} cuentas como máximo.`,
    };
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (users.some((u) => u.username.toLowerCase() === trimmedUsername)) {
    return {
      success: false,
      error: 'Ya existe una cuenta con este usuario o correo electrónico.',
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'La contraseña debe tener mínimo 6 caracteres.',
    };
  }

  const hash = await hashPassword(password);
  const secondUser: AuthUser = {
    id: 'admin_' + Date.now(),
    username: trimmedUsername,
    name: name.trim() || 'Segundo Acceso Autorizado',
    role: 'admin',
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  const newUsers = [...users, secondUser];
  saveStoredUsers(newUsers);

  return {
    success: true,
    user: secondUser,
  };
}

/**
 * Updates a user's password
 */
export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  const newHash = await hashPassword(newPassword);
  users[index] = {
    ...users[index],
    passwordHash: newHash,
  };
  saveStoredUsers(users);

  // If updating current session
  const current = getCurrentSession();
  if (current && current.id === userId) {
    saveCurrentSession(users[index]);
  }
  return true;
}

/**
 * Deletes the second authorized account
 */
export function removeUserAccount(userId: string): boolean {
  const users = getStoredUsers();
  const userToRemove = users.find((u) => u.id === userId);
  if (!userToRemove || userToRemove.role === 'owner') {
    // Cannot delete the owner
    return false;
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveStoredUsers(filtered);
  return true;
}
