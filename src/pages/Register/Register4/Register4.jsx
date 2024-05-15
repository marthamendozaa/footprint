import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { getHabilidades, crearUsuario } from '../../../api/api.js';
import { Spinner } from 'react-bootstrap';
import './Register4.css';

export const Register4 = ({ onPrev, usuario }) => {
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [habilidades, setHabilidades] = useState(null);
    const [habilidadesUsuario, setHabilidadesUsuario] = useState(usuario.listaHabilidades ? usuario.listaHabilidades : {});
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('register4-body');

        return () => {
            document.body.classList.remove('register4-body');
        };
    }, []);

    // Cargar habilidades
    useEffect(() => {
        const fetchData = async () => {
            try {
                const habilidadesData = await getHabilidades();
                setHabilidades(habilidadesData);
            } catch (error) {
                console.error("Error al cargar las habilidades:", error.message);
            }
        };
        fetchData();
    }, []);

    // Manejar cambios en las habilidades del usuario
    const toggleHabilidad = (habilidad, idHabilidad) => {
        const nuevasHabilidadesUsuario = { ...habilidadesUsuario };

        if (Object.keys(nuevasHabilidadesUsuario).includes(`${idHabilidad}`)) {
            if (Object.keys(nuevasHabilidadesUsuario).length === 1) {
                setError('Por favor, selecciona al menos una habilidad');
                setShowModal(true);
                return;
            }
            delete nuevasHabilidadesUsuario[idHabilidad];
          } else {
            nuevasHabilidadesUsuario[idHabilidad] = habilidad;
          }
        
          setHabilidadesUsuario(nuevasHabilidadesUsuario); 
    };   

    // Manejar registro
    const [terminarDesactivado, setTerminarDesactivado] = useState(false);
    const { setUser, setAdmin } = useAuth();

    const handleRegister = async (event) => {
        event.preventDefault();
        
        if (Object.keys(habilidadesUsuario).length === 0) {
            setError('Por favor, selecciona al menos una habilidad');
            setShowModal(true);
            return;
        }
        
        setTerminarDesactivado(true);
        try {
            usuario.listaHabilidades = habilidadesUsuario;

            // Calcular la edad
            const edadMs = Date.now() - usuario.fechaNacimiento.getTime();
            const edadFecha = new Date(edadMs);
            usuario.edad = Math.abs(edadFecha.getUTCFullYear() - 1970);

            const response = await crearUsuario(usuario);
            if (response.success) {
                setUser(response.data);
                setAdmin(false);
                navigate('/explore');
            } else {
                setError('Error al registrar usuario.');
                setShowModal(true);
            }
        } catch (error) {
            setError('Error al registrar habilidades. Por favor, inténtalo de nuevo.');
            setShowModal(true);
        } finally {
            setTerminarDesactivado(false);
        }
    };

    const handlePrev = () => {
      usuario.listaHabilidades = habilidadesUsuario;
      onPrev(usuario);
    }

    return (
        <div className='container-register4-1'>
            <div className='container-register4-2'> 
                {/* Texto */}
                <div className='container-register4-3'>
                    <p className='texto-register4'>Selecciona tus habilidades</p>
                </div>
                
                {habilidades === null ? (
                    <div className="spinner-container">
                        <Spinner animation="border" role="status"></Spinner>
                    </div>
                ) : (
                    <form onSubmit={handleRegister}>
                        {/* Mostrar la lista de habilidades */}
                        <div className="habilidades-register4">
                            <div className='r4-etiquetas'>
                            {Object.entries(habilidades).map(([idHabilidad, habilidad]) => (
                                <li key={idHabilidad} className={`r4-etiquetas-item ${habilidadesUsuario[idHabilidad] ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                                    {habilidad}
                                </li>
                            ))}
                            </div>
                        </div>
                        
                        {/* Flechas */}
                        <div className='flecha-register4-container'>
                            {/* Regreso */}
                            <div className='flecha-register4-container-start'>
                                <button type="button" className="btn flecha-btn" onClick={handlePrev}>
                                    <FaArrowLeft />
                                </button>
                            </div>
                            
                            {/* Terminar con registro */}
                            <div className='flecha-register4-container-end'>
                                <button type="submit" className="btn flecha-btn" disabled={terminarDesactivado}>
                                    {/*<FaArrowRight />*/}
                                    Terminar
                                </button>
                            </div>
                            
                        </div>

                    </form>
                )}

                {/* Pop-up de error */}
                {showModal && (
                    <div className='pop-up-register4'>
                        <div className='pop-up-4-register4'>
                            <h2 style={{ textAlign: 'center' }}>Error</h2>
                            <p style={{ textAlign: 'left', marginTop: '20px' }}>{error}</p>
                            <button onClick={() => setShowModal(false)}>Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};