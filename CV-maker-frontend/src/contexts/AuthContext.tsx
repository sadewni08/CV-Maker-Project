
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Public user fields (used by app)
// interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// // Stored user includes password
// interface StoredUser extends User {
//   password: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<boolean>;
//   register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
//   logout: () => void;
//   resetPassword: (email: string) => Promise<boolean>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
//       const foundUser = users.find((u) => u.email === email && u.password === password);

//       if (foundUser) {
//         const userData: User = {
//           id: foundUser.id,
//           email: foundUser.email,
//           firstName: foundUser.firstName,
//           lastName: foundUser.lastName
//         };
//         setUser(userData);
//         setIsAuthenticated(true);
//         localStorage.setItem('currentUser', JSON.stringify(userData));
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Login error:', error);
//       return false;
//     }
//   };

//   const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
//     try {
//       const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');

//       if (users.find((u) => u.email === email)) {
//         return false; // user already exists
//       }

//       const newUser: StoredUser = {
//         id: Date.now().toString(),
//         email,
//         password,
//         firstName,
//         lastName
//       };

//       users.push(newUser);
//       localStorage.setItem('users', JSON.stringify(users));

//       const userData: User = {
//         id: newUser.id,
//         email: newUser.email,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName
//       };

//       setUser(userData);
//       setIsAuthenticated(true);
//       localStorage.setItem('currentUser', JSON.stringify(userData));

//       return true;
//     } catch (error) {
//       console.error('Registration error:', error);
//       return false;
//     }
//   };

//   const logout = (): void => {
//     setUser(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem('currentUser');
//   };

//   const resetPassword = async (email: string): Promise<boolean> => {
//     try {
//       const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
//       const userExists = users.some((u) => u.email === email);
//       return userExists;
//     } catch (error) {
//       console.error('Reset password error:', error);
//       return false;
//     }
//   };

//   const value: AuthContextType = {
//     user,
//     isAuthenticated,
//     login,
//     register,
//     logout,
//     resetPassword
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };




import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:9000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      if (res.status === 409) return false; // Email exists

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Optional: create an endpoint like /api/auth/reset-password
    return true;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};