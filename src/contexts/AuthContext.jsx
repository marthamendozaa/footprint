import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Obtiene usuario de la sesión
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Obtiene estado de administrador de la sesión
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = sessionStorage.getItem('admin');
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });

  useEffect(() => {
    // Detecta cambios en estado de usuario y admin (login/logout), actualiza sesión
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('admin', JSON.stringify(admin));
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('admin');
    }
  }, [user, admin]);

  // Exporta funciones para actualizar usuario y estado de administrador
  const value = { user, admin, setUser, setAdmin };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);