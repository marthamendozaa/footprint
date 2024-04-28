import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { getUsuario, updateUsuarioNombre, getHabilidadesUsuario, actualizaHabilidades, getInteresesUsuario, actualizaIntereses, cerrarSesion, cambiarContrasena, uploadProfileImage, updateUsuarioImage, deleteProfileImage } from './Profile-fb.js';
import Usuario from '../../backend/obj-Usuario.js';
import Modal from 'react-bootstrap/Modal';
import './Profile.css';
import axios from 'axios';


export const Profile = () => {
  // Cerrar sesión
  const [sesionCerrada, setSesionCerrada] = useState(false);
  const navigate = useNavigate();

  const botonCerrarSesion = async () => {
    await cerrarSesion();
    setSesionCerrada(true);
    navigate('/login');
  };


  // Información del perfil
  const [informacionUsuario, setinformacionUsuario] = useState(new Usuario());
  
  useEffect(() => {
    const fetchData = async () => {
      if (!sesionCerrada) {
        const infoUsuario = await getUsuario();
        const objUsuario = { ...informacionUsuario, ...infoUsuario };
        setinformacionUsuario(objUsuario);
      }
    };
    fetchData();
  }, [sesionCerrada]);


  // Cambiar nombre del perfil
  const [editingNombre, setEditingNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const handleNombreEdit = () => {
    setEditingNombre(true);
    setNuevoNombre(informacionUsuario.nombre);
  };

  const handleNombreChange = (event) => {
    setNuevoNombre(event.target.value);
  };

  const handleNombreSubmit = async () => {
    await updateUsuarioNombre(nuevoNombre);
    setEditingNombre(false);
    const infoUsuario = await getUsuario();
    setinformacionUsuario(infoUsuario);
  };


  // Habilidades del usuario
  const [habilidades, setHabilidades] = useState(null);
  const [habilidadesUsuario, setHabilidadesUsuario] = useState(null);
  
  // Editar habilidades
  const toggleHabilidad = async (habilidad, idHabilidad) => {
    const habilidadesUsuarioNueva = { ...habilidadesUsuario };

    if (Object.keys(habilidadesUsuarioNueva).includes(`${idHabilidad}`)) {
      if (Object.keys(habilidadesUsuarioNueva).length === 1) {
        alert("Debes tener al menos una habilidad");
        return;
      }
      delete habilidadesUsuarioNueva[idHabilidad];
    } else {
      habilidadesUsuarioNueva[idHabilidad] = habilidad;
    }
    
    setHabilidadesUsuario(habilidadesUsuarioNueva);
    await actualizaHabilidades(habilidadesUsuarioNueva);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!sesionCerrada) {
        const getHabilidades = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getHabilidades");
        setHabilidades(getHabilidades.data.data);
  
        const habilidadesUsuarioData = await getHabilidadesUsuario();
        setHabilidadesUsuario(habilidadesUsuarioData);
      }
    };
    fetchData();
  }, [sesionCerrada]);
  

  // Intereses del usuario
  const [intereses, setIntereses] = useState(null);
  const [interesesUsuario, setInteresesUsuario] = useState(null);
  
  // Editar intereses
  const toggleInteres = async (interes, idInteres) => {
    const interesesUsuarioNueva = { ...interesesUsuario };

    if (Object.keys(interesesUsuarioNueva).includes(`${idInteres}`)) {
      if (Object.keys(interesesUsuarioNueva).length === 1) {
        alert("Debes tener al menos un interés");
        return;
      }
      delete interesesUsuarioNueva[idInteres];
    } else {
      interesesUsuarioNueva[idInteres] = interes;
    }
  
    setInteresesUsuario(interesesUsuarioNueva);
    await actualizaIntereses(interesesUsuarioNueva);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!sesionCerrada) {
        const getIntereses = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getIntereses");
        setIntereses(getIntereses.data.data);

        const interesesUsuarioData = await getInteresesUsuario();
        setInteresesUsuario(interesesUsuarioData);
      }
    };
    fetchData();
  }, [sesionCerrada]);


  // Cambiar contraseña
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false); // Estado para controlar si se está cambiando la contraseña
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');

  const handleCancelarCambioContrasena = () => {
    setCambiandoContrasena(false); // Al hacer click en Cancelar, se vuelve a false
  };

  const handleChangePassword = () => {
    setCambiandoContrasena(true);
    setError('')
  };

  // Función para manejar el submit del cambio de contraseña
  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    // Validar que la contraseña actual sea correcta
    try {
      await cambiarContrasena(contrasenaActual, nuevaContrasena);
      // Si la contraseña se cambió con éxito, limpiar los campos y el estado de error
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setError('');
      // Indicar que se ha completado el cambio de contraseña
      setCambiandoContrasena(false);
    } catch (error) {
      setError(error.message);
    }
  };

  
  // Cargar imagen de perfil
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorI, setErrorI] = useState('');

  const openModal = () => {
    setShowModal(true);
    setErrorI('');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleUploadProfileImage = async () => {
    if (!selectedImage) {
      setErrorI('Selecciona una imagen');
      return;
    }

  if (selectedImage.size > 2 * 1024 * 1024) { // 2 MB en bytes
    setErrorI('La imagen seleccionada supera el límite de tamaño de 2 MB');
    return;
  }
  
    try {
      if (informacionUsuario.urlImagen) {
        await deleteProfileImage(informacionUsuario.urlImagen);
      }

      const imageUrl = await uploadProfileImage(selectedImage);
      await updateUsuarioImage(imageUrl);
      const infoUsuario = await getUsuario();
      setinformacionUsuario(infoUsuario);
      closeModal();
    } catch (error) {
      console.error("Error al subir la imagen de perfil:", error.message);
    }
  };

  return (
    <div className="profile-page">
      {habilidades && habilidadesUsuario && intereses && interesesUsuario ? (
      <header className="Profile-header">
        <h1>Mi perfil</h1>
          <div className="profile-info">
            <div className="profile-info-left">
              <div className="Foto-perfil position-relative">
                <img src={informacionUsuario.urlImagen} className="Foto-perfil img-fluid rounded-circle" alt="perfil" />
                <FaPen className="edit-icon" onClick={openModal} /> {/* Abrir el modal al hacer clic en el ícono */}
              
                {/* Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                      <Modal.Header closeButton>
                          <Modal.Title className='p-modaltitle'>Foto de perfil</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className='p-modalinfo'>
                      <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                      {errorI && <p style={{ color: 'red' }}>{errorI}</p>}
                      </Modal.Body>
                      <Modal.Footer>
                          <button variant="secondary" onClick={handleUploadProfileImage}>
                              Guardar Imagen
                          </button>
                      </Modal.Footer>
                  </Modal>
              </div>
          </div>
          <div className="profile-info-right">
            <div className="name-container">
              <h2>
                  {editingNombre ? (
                    <input
                      type="text"
                      value={nuevoNombre}
                      onChange={handleNombreChange}
                    />
                  ) : (
                    informacionUsuario.nombre
                  )}
                  {!editingNombre && (
                    <button className="edit-profile-btn" onClick={handleNombreEdit}>
                      <FaPen />
                    </button>
                  )}
                  {editingNombre && (
                    <button className="edit-profile-btn guardar" onClick={handleNombreSubmit}>
                      Guardar
                    </button>
                  )}
                </h2>
                </div>
              <p>{informacionUsuario.edad} años</p>
              <h3>{informacionUsuario.nombreUsuario} </h3>
              <p>{informacionUsuario.correo} </p>
              <p className="change-password" onClick={handleChangePassword}>Cambiar contraseña</p>
              {cambiandoContrasena && (
                <form className="change-password-form" onSubmit={handleSubmitPassword}>
                  <input
                    className='change-password-input' type="password"
                    placeholder="Contraseña actual"
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
                  />
                  <input
                    className='change-password-input' type="password"
                    placeholder="Nueva contraseña"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                  />
                  <input
                    className='change-password-input' type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                  />
                  <button className="change-password-cancel" type="button" onClick={handleCancelarCambioContrasena}>Cancelar</button>
                  <button className='change-password-submit' type="submit">Guardar</button>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
              )}
              </div>
              
          </div>
          <div className="subtitle skills-interests">
            <h3>Habilidades</h3>
            <div className='p-etiquetas'>
              {Object.values(habilidades).map((habilidad, idHabilidad) => (
                <li key={idHabilidad} className={`p-etiquetas-item ${Object.values(habilidadesUsuario).includes(habilidad) ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                  {habilidad}
                </li>
              ))}
            </div>
          </div>
          <div className="subtitle skills-interests">
            <h3>Temas de interés</h3> 
            <div className='p-etiquetas'>
              {Object.values(intereses).map((interes, idInteres) => (
                <li key={idInteres} className={`p-etiquetas-item  ${Object.values(interesesUsuario).includes(interes) ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
                  {interes}
                </li>
              ))}
            </div>
          </div>
          <div className="perfil-logout" style={{borderRadius: "18px"}}>
            <button onClick={botonCerrarSesion}>Cerrar Sesión</button>
            </div>
        </header>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  )
}