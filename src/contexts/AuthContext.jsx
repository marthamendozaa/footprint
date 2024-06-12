import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSolicitudes } from '../api/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Obtiene usuario de la sesión
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Obtiene notificaciones del usuario
  const [notificaciones, setNotificaciones] = useState(0);

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

      // Obtiene notificaciones del usuario
      const fetchData = async () => {
        let notificaciones = await getSolicitudes("Usuarios", user);
        notificaciones = notificaciones.filter((solicitud) => solicitud.estado == "Pendiente" || solicitud.tipoInvitacion == "UsuarioAIniciativa");
        setNotificaciones(notificaciones.length);
      };

      fetchData();
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('admin');
    }
  }, [user, admin]);

  // Exporta funciones para actualizar usuario y estado de administrador
  const value = { user, admin, notificaciones, setUser, setAdmin, setNotificaciones};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);