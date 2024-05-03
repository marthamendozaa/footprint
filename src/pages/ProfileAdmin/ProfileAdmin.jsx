import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export const ProfileAdmin = () => {
    const [sesionCerrada, setSesionCerrada] = useState(false);
    const { setUser, setAdmin } = useAuth();
    const navigate = useNavigate();

    const botonCerrarSesion = async () => {
        setUser(null);
        setAdmin(null);
        setSesionCerrada(true);
        navigate('/login');
    };

    return (
        <div>
        <h1>Profile</h1>
        <div className="logout-btn"><button onClick={botonCerrarSesion}>Cerrar Sesión</button></div>
        </div>
    );
};