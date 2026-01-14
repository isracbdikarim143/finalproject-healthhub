import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        
        await loadProfile(session.user.id);
        
        
        if (event === 'SIGNED_IN') {
          await supabase
            .from('users_profile')
            .update({ 
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        
        if (error.code === 'PGRST116') {
          const { data: newProfile } = await supabase
            .from('users_profile')
            .insert({
              user_id,
              name: 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
          
          if (newProfile) {
            setProfile(newProfile);
          }
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('rate_limit')) {
        throw new Error('⚠️ Too many attempts. Please wait 1-2 minutes and try again.');
      }
      if (error.message.includes('already registered')) {
        throw new Error('⚠️ This email is already registered. Please login instead.');
      }
      throw error;
    }

    if (data.user) {
      // Use upsert to handle duplicate profiles gracefully
      const { error: profileError } = await supabase
        .from('users_profile')
        .upsert({
          user_id,
          name,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Try to fetch existing profile instead
        await loadProfile(data.user.id);
      }
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('rate_limit') || error.status === 429) {
        throw new Error('⚠️ Too many attempts. Please wait 1-2 minutes and try again.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('⚠️ Invalid email or password. Please try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('⚠️ Please confirm your email before logging in.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (user) {
      // Update logout time
      await supabase
        .from('users_profile')
        .update({ last_logout: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('users_profile')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) throw error;
    await refreshProfile();
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
