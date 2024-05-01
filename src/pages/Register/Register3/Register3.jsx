import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import { getIntereses } from './Register3-fb';
import './Register3.css';

export const Register3 = ({ onPrev, onNext }) => {
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [intereses, setIntereses] = useState(null);
    const [interesesUsuario, setInteresesUsuario] = useState({});

    useEffect(() => {
        document.body.classList.add('register2-body');

        return () => {
            document.body.classList.remove('register2-body');
        };
    }, []);

    // Cargar intereses
    useEffect(() => {
        const fetchData = async () => {
            try {
                const interesesData = await getIntereses();
                setIntereses(interesesData);
            } catch (error) {
                console.error("Error al cargar los intereses:", error.message);
            }
        };
        fetchData();
    }, []);

    // Manejar cambios en los intereses del usuario
    const toggleInteres = (interes, idInteres) => {
        const nuevosInteresesUsuario = { ...interesesUsuario };
        
        if (Object.keys(nuevosInteresesUsuario).includes(`${idInteres}`)) {
            if (Object.keys(nuevosInteresesUsuario).length === 1) {
                setError('Por favor, selecciona al menos un interés');
                setShowModal(true);
                return;
            }
            delete nuevosInteresesUsuario[idInteres];
          } else {
            nuevosInteresesUsuario[idInteres] = interes;
          }
        
          setInteresesUsuario(nuevosInteresesUsuario);          
    };   

    // Manejar registro
    const handleRegister = async (event) => {
        event.preventDefault();

        if (Object.keys(interesesUsuario).length === 0) {
            setError('Por favor, selecciona al menos un interés');
            setShowModal(true);
            return;
        }

        try {
            onNext();
        } catch (error) {
            setError('Error al registrar intereses. Por favor, inténtalo de nuevo.');
            setShowModal(true);
        }
    };

    return (
        <div className='container-register3-1'>
            <div className='container-register3-2'> 
                {/* Texto */}
                <div className='container-register3-3'>
                    <p className='texto-register3'>Selecciona tus intereses</p>
                </div>

                {intereses === null ? (
                    <div className="spinner-container">
                        <Spinner animation="border" role="status"></Spinner>
                    </div>
                ) : (
                    <form onSubmit={handleRegister}>
                        {/* Mostrar la lista de intereses */}
                        <div className="intereses-register3">
                            <div className='r3-etiquetas'>
                            {Object.entries(intereses).map(([idInteres, interes]) => (
                                <li key={idInteres} className={`r3-etiquetas-item ${interesesUsuario[idInteres] ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
                                    {interes}
                                </li>
                            ))}
                            </div>
                        </div>

                        {/* Flechas */}
                        <div className='flecha-register3-container'>
                            {/* Regreso */}
                            <div className='flecha-register3-container-start'>
                                <button type="button" className="btn flecha-btn" onClick={onPrev}>
                                    <FaArrowLeft />
                                </button>
                            </div>

                            {/* Continuar con registro */}
                            <div className='flecha-register3-container-end'>
                                <button type="submit" className="btn flecha-btn">
                                    <FaArrowRight />
                                </button>
                            </div>

                        </div>

                    </form>
                )}

                {/* Pop-up de error */}
                {showModal && (
                    <div className='pop-up-register3'>
                        <div className='pop-up-3-register3'>
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