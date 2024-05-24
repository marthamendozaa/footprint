import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { getIntereses } from '../../../api/api.js';
import { Spinner } from 'react-bootstrap';
import './Register3.css';

export const Register3 = ({ onPrev, onNext, usuario }) => {
    const [intereses, setIntereses] = useState(null);
    const [interesesUsuario, setInteresesUsuario] = useState(usuario.listaIntereses ? usuario.listaIntereses : {});

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
            delete nuevosInteresesUsuario[idInteres];
          } else {
            nuevosInteresesUsuario[idInteres] = interes;
          }
        
          setInteresesUsuario(nuevosInteresesUsuario);          
    };   

    // Manejar registro
    const handleRegister = async (event) => {
        event.preventDefault();
        usuario.listaIntereses = interesesUsuario;
        onNext(usuario);
    };

    const handlePrev = () => {
      usuario.listaIntereses = interesesUsuario;
      onPrev(usuario);
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
                                <button type="button" className="btn flecha-btn" onClick={handlePrev}>
                                    <FaArrowLeft />
                                </button>
                            </div>

                            {/* Continuar con registro */}
                            <div className='flecha-register3-container-end'>
                                <button type="submit" className="btn flecha-btn" disabled={Object.keys(interesesUsuario).length === 0}>
                                    <FaArrowRight />
                                </button>
                            </div>

                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};