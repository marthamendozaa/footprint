import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../backend/Profile-functions.js';

export const ProfileAdmin = () => {
    const [sesionCerrada, setSesionCerrada] = useState(false);
    const navigate = useNavigate();

    const botonCerrarSesion = async () => {
        await cerrarSesion();
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