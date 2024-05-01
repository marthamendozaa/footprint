import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import { getHabilidades } from './Register4-fb';
import './Register4.css';

export const Register4 = ({ onPrev }) => {
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [habilidades, setHabilidades] = useState(null);
    const [habilidadesUsuario, setHabilidadesUsuario] = useState({});
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
    const handleRegister = async (event) => {
        event.preventDefault();
        
        if (Object.keys(habilidadesUsuario).length === 0) {
            setError('Por favor, selecciona al menos una habilidad');
            setShowModal(true);
            return;
        }

        try {
            navigate('/login'); 
        } catch (error) {
            setError('Error al registrar habilidades. Por favor, inténtalo de nuevo.');
            setShowModal(true);
        }
    };

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
                                <button type="button" className="btn flecha-btn" onClick={onPrev}>
                                    <FaArrowLeft />
                                </button>
                            </div>
                            
                            {/* Terminar con registro */}
                            <div className='flecha-register4-container-end'>
                                <button type="submit" className="btn flecha-btn">
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