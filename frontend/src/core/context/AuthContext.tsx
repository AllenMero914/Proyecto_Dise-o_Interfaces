import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase.config';
import { firestoreService } from '../services/firestore.service';

interface UserData {
  uid: string;
  email: string | null;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nombre: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  updatePasswordUser: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      const local = localStorage.getItem('profact_user');
      if (local) setUser(JSON.parse(local));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let nombre = firebaseUser.email?.split('@')[0] || 'Usuario';
        let rol = 'user';
        try {
          const userData = await firestoreService.getById<{ nombre: string; rol: string }>(
            'usuarios',
            firebaseUser.uid
          );
          if (userData) {
            nombre = userData.nombre;
            rol = userData.rol;
          }
        } catch { /* sin Firestore, usar datos por defecto */ }
        const u: UserData = { uid: firebaseUser.uid, email: firebaseUser.email, nombre, rol };
        setUser(u);
        localStorage.setItem('profact_user', JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem('profact_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch {
        return false;
      }
    }
    if (email === 'root' && password === '12345') {
      const u: UserData = { uid: 'local-root', email: 'root@local', nombre: 'Administrador', rol: 'ADMIN' };
      setUser(u);
      localStorage.setItem('profact_auth', 'true');
      localStorage.setItem('profact_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, nombre: string): Promise<boolean> => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await firestoreService.create('usuarios', {
          uid: cred.user.uid,
          nombre,
          email,
          rol: 'user',
          activo: true,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('profact_auth');
    localStorage.removeItem('profact_user');
  };

  const updateProfile = async (data: Partial<UserData>) => {
    if (user) {
      if (isFirebaseConfigured) {
        await firestoreService.update('usuarios', user.uid, data);
      }
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('profact_user', JSON.stringify(updated));
    }
  };

  const updatePasswordUser = async (currentPassword: string, newPassword: string) => {
    if (isFirebaseConfigured && auth?.currentUser && user?.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePasswordUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
