import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser as loginAPI, logoutUser as logoutAPI, registerUser as registerAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await getCurrentUser();
      if (data?.data) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const { data } = await loginAPI(credentials);
    if (data?.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    if (data?.data?.user) {
      setUser(data.data.user);
    }
    return data;
  };

  const register = async (formData) => {
    const { data } = await registerAPI(formData);
    return data;
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        refetchUser: fetchCurrentUser,
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

export default AuthContext;
