'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/kanban';
import { fetchUsers, loginUser as apiLogin, registerUser as apiRegister } from '@/lib/db';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: User) => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_STORAGE = 'kanban_active_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users and restored active session
  useEffect(() => {
    async function initAuth() {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);

        // Check if there is an active user in localStorage
        const storedUserJson = localStorage.getItem(ACTIVE_USER_STORAGE);
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson);
            // Verify if still in users list or keep parsed
            const match = fetchedUsers.find((u) => u.id === parsed.id || u.username === parsed.username);
            setCurrentUser(match || parsed);
          } catch {
            localStorage.removeItem(ACTIVE_USER_STORAGE);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const refreshUsers = async () => {
    const list = await fetchUsers();
    setUsers(list);
  };

  const login = async (username: string, password: string) => {
    try {
      const user = await apiLogin(username, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(ACTIVE_USER_STORAGE, JSON.stringify(user));
        await refreshUsers();
        return { success: true };
      }
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      return { success: false, error: msg };
    }
  };

  const register = async (username: string, name: string, password: string) => {
    try {
      if (!username.trim() || !name.trim() || !password.trim()) {
        return { success: false, error: 'Por favor completa todos los campos' };
      }
      const newUser = await apiRegister(username, name, password);
      setCurrentUser(newUser);
      localStorage.setItem(ACTIVE_USER_STORAGE, JSON.stringify(newUser));
      await refreshUsers();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_STORAGE);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(ACTIVE_USER_STORAGE, JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
