import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { getHabilidades, actualizaHabilidades } from './Register4-fb';
import './Register4.css';

export const Register4 = () => {
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
    const toggleHabilidad = (idHabilidad) => {
        const nuevasHabilidadesUsuario = { ...habilidadesUsuario };

        nuevasHabilidadesUsuario[idHabilidad] = !nuevasHabilidadesUsuario[idHabilidad];

        setHabilidadesUsuario(nuevasHabilidadesUsuario);
        
        console.log("Habilidades Usuario:", nuevasHabilidadesUsuario);
    };   

    // Manejar registro
    const handleRegister = async (event) => {
        event.preventDefault();
        
        // Validar que se hayan seleccionado al menos una habilidad
        if (Object.keys(habilidadesUsuario).length === 0) {
            setError('Por favor, selecciona al menos una habilidad');
            setShowModal(true);
            return;
        }

        try {
            // Guardar las habilidades del usuario en la base de datos
            await actualizaHabilidades(habilidadesUsuario);
            
            // Navegar a la siguiente página de registro o a donde corresponda
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
                
                <form onSubmit={handleRegister}>
                    {/* Mostrar la lista de habilidades */}
                    <div className="habilidades-register4">
                        <div className='r4-etiquetas'>
                            {habilidades && Object.values(habilidades).map((habilidad, idHabilidad) => (
                                <li key={idHabilidad} className={`r4-etiquetas-item ${habilidadesUsuario[idHabilidad] ? "highlighted" : ""}`} onClick={() => toggleHabilidad(idHabilidad)}>
                                    {habilidad}
                                </li>
                            ))}
                        </div>
                    </div>
                    
                    {/* Flechas */}
                    <div className='flecha-register4-container'>
                        {/* Regreso */}
                        <div className='flecha-register4-container-start'>
                            <Link to="/register3">
                                <button type="button" className="btn flecha-btn">
                                    <FaArrowLeft />
                                </button>
                            </Link>
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
            </div>
            
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
    );
};