import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session and fetch profile
  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || 'User',
          role: profile?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || 'User',
          role: profile?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    // Fetch profile to return role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    return { success: true, role: profile?.role || 'user' };
  };

  const register = async (name, email, password) => {
    try {
      // 1. Call local Vite dev server proxy to create user bypassing email confirm
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const adminResult = await res.json();
      
      if (!adminResult.success) {
        return { success: false, message: adminResult.message || 'Registration failed via local proxy' };
      }
      
      // 2. Sign in as the newly created user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true };
    } catch (e) {
      // Fallback to normal signup if the API proxy fails (e.g. in production)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getRegisteredUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email');
    if (error) {
      console.error('Error fetching registered users:', error);
      return [];
    }
    return data;
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteUsers = async (userIds) => {
    // Delete from profiles
    const { error } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds);
    if (error) {
      console.error('Error deleting profiles:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getRegisteredUsers, updateUserRole, deleteUsers }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
