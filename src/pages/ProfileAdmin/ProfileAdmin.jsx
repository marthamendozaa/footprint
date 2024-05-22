import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FaCog } from 'react-icons/fa';
import './ProfileAdmin.css';

export const ProfileAdmin = () => {
    const [sesionCerrada, setSesionCerrada] = useState(false);
    const [showModalSesionCerrada, setShowModalSesionCerrada] = useState(false);
    const { setUser, setAdmin } = useAuth();
    const navigate = useNavigate();

    const openModalSesionCerrada = () => {
        setShowModalSesionCerrada(true);
    };
    
    const closeModalSesionCerrada = () => {
        setShowModalSesionCerrada(false);
    };
    
    const botonCerrarSesion = async () => {
        setUser(null);
        setAdmin(null);
        setSesionCerrada(true);
        navigate('/login');
    };

    return (
        <div>

        <h1>Profile</h1>

        <div className="perfil-logout" style={{borderRadius: "18px"}}>
        <button onClick={openModalSesionCerrada}> <FaCog className='p-fa-gear' /> Cerrar Sesión</button>
        </div>

        {/* Modal para cerrar sesión */} 
        <Modal className="p-modal" show={showModalSesionCerrada} onHide={closeModalSesionCerrada}>
            <Modal.Header>
                <Modal.Title className='p-modal-title'>Cerrar Sesión</Modal.Title>
            </Modal.Header>

            <p className='p-modal-body'>Si deseas salir has clic en Cerrar Sesión o en Cancelar para continuar trabajando</p>

            <Modal.Footer>
                <Button className="btn-salir-sesion" onClick={botonCerrarSesion}>Cerrar Sesión</Button>
                <Button onClick={closeModalSesionCerrada}>Cancelar</Button>
            </Modal.Footer>
        </Modal>

        </div>




    );
};