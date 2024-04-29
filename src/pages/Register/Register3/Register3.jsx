import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { getIntereses, actualizaIntereses } from './Register3-fb';
import './Register3.css';

export const Register3 = () => {
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [intereses, setIntereses] = useState(null);
    const [interesesUsuario, setInteresesUsuario] = useState({});
    const navigate = useNavigate();

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
    const toggleInteres = (idInteres) => {
        const nuevosInteresesUsuario = { ...interesesUsuario };
    
        nuevosInteresesUsuario[idInteres] = !nuevosInteresesUsuario[idInteres];
    
        setInteresesUsuario(nuevosInteresesUsuario);  
        
        console.log("Intereses Usuario:", nuevosInteresesUsuario);
    };   

    // Manejar registro
    const handleRegister = async (event) => {
        event.preventDefault();

        // Validar que se hayan seleccionado al menos un interés
        console.log("Condicion que se esta revisando:", Object.keys(interesesUsuario).length);
        if (Object.keys(interesesUsuario).length === 0) {
            setError('Por favor, selecciona al menos un interés');
            setShowModal(true);
            return;
        }

        try {
            // Guardar los intereses del usuario en la base de datos
            await actualizaIntereses(interesesUsuario);
            
            // Navegar a la siguiente página de registro o a donde corresponda
            navigate('/register3');
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

                <form onSubmit={handleRegister}>
                    {/* Mostrar la lista de intereses */}
                    <div className="intereses-register3">
                        <div className='r3-etiquetas'>
                            {intereses && Object.values(intereses).map((interes, idInteres) => (
                                <li key={idInteres} className={`r3-etiquetas-item  ${interesesUsuario[idInteres] ? "highlighted" : ""}`} onClick={() => toggleInteres(idInteres)}>
                                    {interes}
                                </li>
                            ))}
                        </div>
                        
                    </div>

                    {/* Flechas */}
                    <div className='flecha-register3-container'>
                        {/* Regreso */}
                        <div className='flecha-register3-container-start'>
                            <Link to="/register2">
                                <button type="button" className="btn flecha-btn">
                                    <FaArrowLeft />
                                </button>
                            </Link>
                        </div>

                        {/* Continuar con registro */}
                        <div className='flecha-register3-container-end'>
                            <button type="submit" className="btn flecha-btn">
                                <FaArrowRight />
                            </button>
                        </div>

                    </div>

                </form>
            </div>

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
    );
};