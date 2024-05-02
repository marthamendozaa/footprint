import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope } from 'react-icons/fa';
import { getUsuario, updateUsuarioNombre, getHabilidades, getHabilidadesUsuario, actualizaHabilidades, getIntereses, getInteresesUsuario, actualizaIntereses, cerrarSesion, cambiarContrasena, uploadProfileImage, updateUsuarioImage, deleteProfileImage } from './Profile-fb.js';
import Usuario from '../../backend/obj-Usuario.js';
import './Profile.css';
import { FaU } from 'react-icons/fa6';

export const Profile = () => {
  // Cerrar sesión
  const [sesionCerrada, setSesionCerrada] = useState(false);
  const [showModalSesionCerrada, setShowModalSesionCerrada] = useState(false);
  const navigate = useNavigate();
  
  const openModalSesionCerrada = () => {
    setShowModalSesionCerrada(true);
  };

  const closeModalSesionCerrada = () => {
    setShowModalSesionCerrada(false);
  };

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


  // Modal de erroes
  const [showModalError, setShowModalError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  
  const openModalError = (errorMessage) => {
    setShowModalError(true);
    setErrorMensaje(errorMessage);
  };

  const closeModalError = () => {
    setShowModalError(false);
  };


  // Cambiar nombre del perfil
  const [editingNombre, setEditingNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const onlyLetters = (text) => {
    return /^[a-zA-ZñÑáéíóúüÁÉÍÓÚ\s]+$/.test(text);
  };  

  const handleNombreEdit = () => {
    setEditingNombre(true);
    setNuevoNombre(informacionUsuario.nombre);
  };

  const handleNombreChange = (event) => {
    setNuevoNombre(event.target.value);
  };

  const handleGuardarNombre = async () => {
    if (nuevoNombre.trim() === '') {
      const errorMessage = 'El nombre no puede estar vacío';
      openModalError(errorMessage);
      return;
    }
  
    if (!onlyLetters(nuevoNombre)) {
      const errorMessage = 'El nombre solo puede contener letras';
      openModalError(errorMessage);
      return;
    }
    
    await updateUsuarioNombre(nuevoNombre);
    setEditingNombre(false);
    const infoUsuario = await getUsuario();
    setinformacionUsuario(infoUsuario);
  };

  const handleNombreSubmit = async (event) => {
    if (event.key === 'Enter') {
      if (nuevoNombre.trim() === '') {
        const errorMessage = 'El nombre no puede estar vacío';
        openModalError(errorMessage);
        return;
      }
    
      if (!onlyLetters(nuevoNombre)) {
        const errorMessage = 'El nombre solo puede contener letras';
        openModalError(errorMessage);
        return;
      }

      await updateUsuarioNombre(nuevoNombre);
      setEditingNombre(false);
      const infoUsuario = await getUsuario();
      setinformacionUsuario(infoUsuario);
    }
  };  

  // Habilidades del usuario
  const [habilidades, setHabilidades] = useState(null);
  const [habilidadesUsuario, setHabilidadesUsuario] = useState(null);
  
  // Editar habilidades
  const toggleHabilidad = async (habilidad, idHabilidad) => {
    const habilidadesUsuarioNueva = { ...habilidadesUsuario };

    if (Object.keys(habilidadesUsuarioNueva).includes(`${idHabilidad}`)) {
      if (Object.keys(habilidadesUsuarioNueva).length === 1) {
        const errorMessage = 'Debes tener al menos una habilidad';
        openModalError(errorMessage);
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
        const habilidadesData = await getHabilidades();
        setHabilidades(habilidadesData);
  
        const habilidadesUsuarioData = await getHabilidadesUsuario();
        setHabilidadesUsuario(habilidadesUsuarioData);
      }
    };
    fetchData();
  }, [sesionCerrada]);
  

  // Intereses del usuario
  const [intereses, setIntereses] = useState(null);
  const [interesesUsuario, setInteresesUsuario] = useState(null);
  
  // Editar habilidades
  const toggleInteres = async (interes, idInteres) => {
    const interesesUsuarioNueva = { ...interesesUsuario };

    if (Object.keys(interesesUsuarioNueva).includes(`${idInteres}`)) {
      if (Object.keys(interesesUsuarioNueva).length === 1) {
        const errorMessage = 'Debes tener al menos un interés';
        openModalError(errorMessage);
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
        const interesesData = await getIntereses();
        setIntereses(interesesData);
  
        const interesesUsuarioData = await getInteresesUsuario();
        setInteresesUsuario(interesesUsuarioData);
      }
    };
    fetchData();
  }, [sesionCerrada]);


  // Cambiar contraseña
  const [showModalContrasena, setShowModalContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const openModalContrasena = () => {
    setShowModalContrasena(true);
  };

  const closeModalContrasena = () => {
    setShowModalContrasena(false);
  };

  const handleSubmitPassword = async () => {
    event.preventDefault();
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    try {
      await cambiarContrasena(contrasenaActual, nuevaContrasena);
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setError('');
      setShowModalContrasena(false);
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

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!showModal) {
      openModal();
    }
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
      {/* Spinner */}
      {habilidades && habilidadesUsuario && intereses && interesesUsuario ? (
        <header className="profile-header">
          {/* Titulo */}
          <h1>Mi perfil</h1>

          {/* Información del usuario */}
          <div className="profile-info">

            {/* Info foto */}
            <div className="profile-info-left">
              {/* Foto de perfil */}
              <div className="p-foto" onClick={handleImageClick}>
                <img src={informacionUsuario.urlImagen} className="p-preview-imagen"/>
                <FaPen className="p-editar-foto"/>
              </div>
            </div>

            {/* Información a lado de la foto */}
            <div className="profile-info-right">
              {/* Nombre del usuario */}
              <div className="name-container">
                <h2>
                  {/* Nombre del usuario */}
                  {editingNombre ? (
                    <>
                      <input
                        type="text"
                        className="edit-name-box"
                        value={nuevoNombre}
                        onChange={handleNombreChange}
                        onBlur={handleGuardarNombre}
                        onKeyDown={handleNombreSubmit}
                        autoFocus
                        maxLength={30}
                      />
                      <div className="p-titulo-conteo">
                        {nuevoNombre ? `${nuevoNombre.length}/30` : `0/30`}
                      </div>
                    </>
                  ) : (
                    informacionUsuario.nombre
                  )}

                  {/* Botón para editar el nombre */}
                  {!editingNombre && (
                    <button className="edit-profile-btn" onClick={handleNombreEdit}>
                      <FaPen />
                    </button>
                  )}
                </h2>
              </div>
              
              <div className="p-info">
                {/* Edad */}
                <div className="profile-icons-text">
                  <p> <span> Edad: </span> {informacionUsuario.edad} años</p>
                </div>

                {/* Usuario */}
                <div className="profile-icons-text">
                  <FaUser className="profile-icons-text-icon"/> 
                  <span> Usuario: </span> 
                  <p> 
                    {informacionUsuario.nombreUsuario} 
                  </p>
                </div>
                
                {/* Correo */}
                <div className="profile-icons-text">
                  <FaEnvelope className="profile-icons-text-icon"/> 
                  <span> Correo: </span> 
                  <p className='p-correo'> 
                    {informacionUsuario.correo}
                  </p>
                </div>

                {/* Cambiar contraseña */}
                <button className="change-password" onClick={openModalContrasena}>Cambiar contraseña</button>
              </div>

            </div>
          </div>

          {/* Intereses */}
          <div className="intereses-container">
            <h3>Temas de interés</h3> 
            <div className='p-etiquetas'>
              {Object.values(intereses).map((interes, idInteres) => (
                <li key={idInteres} className={`p-etiquetas-item  ${Object.values(interesesUsuario).includes(interes) ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
                  {interes}
                </li>
              ))}
            </div>
          </div>

          {/* Habilidades */}
          <div className="habilidades-container">
            <h3>Habilidades</h3>
            <div className='p-etiquetas'>
              {Object.values(habilidades).map((habilidad, idHabilidad) => (
                <li key={idHabilidad} className={`p-etiquetas-item ${Object.values(habilidadesUsuario).includes(habilidad) ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                  {habilidad}
                </li>
              ))}
            </div>
          </div>

          {/* Botón para cerrar sesión */}
          <div className="perfil-logout" style={{borderRadius: "18px"}}>
            <button onClick={openModalSesionCerrada}>Cerrar Sesión</button>
          </div>

          {/* ----- Modales ----- */}
          
          {/* Modal para subir imagen */}
          <Modal className="p-modal" show={showModal} onHide={closeModal}>
            <Modal.Header>
              <div className='p-modal-title'>Foto de perfil</div>
            </Modal.Header>
            
            <div className="p-input-body">
              <input className="p-input-imagen" type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
              {errorI && <span style={{ color: 'red' }}>{errorI}</span>}
            </div>
            
            <Modal.Footer>
              <Button onClick={handleUploadProfileImage}>Guardar</Button>
              <Button onClick={closeModal}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal mensaje de error */} 
          <Modal className="p-modal" show={showModalError} onHide={closeModalError}>
            <Modal.Header>
              <Modal.Title className='p-modal-title'>Error</Modal.Title>
            </Modal.Header>
            
            <p className='p-modal-body'>{errorMensaje}</p>
            
            <Modal.Footer>
              <Button onClick={closeModalError}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal cambiar contraseña */} 
          <Modal className="p-modal" show={showModalContrasena} onHide={closeModalContrasena}>
            <Modal.Header>
              <Modal.Title className='p-modal-title'>Cambiar contraseña</Modal.Title>
            </Modal.Header>
           
            <div className="change-password-form">
              {/* Contraseña actual */}
              <div className="caja-con-cojo">
                <input
                  className='change-password-input' 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setContrasenaActual(e.target.value);
                    }
                  }} 
                />
                <span className="p-ojo-contrasena" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Nueva contraseña */}
              <div className="caja-con-cojo">
                <input
                  className='change-password-input' 
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setNuevaContrasena(e.target.value);
                    }
                  }} 
                />
                <span className="p-ojo-contrasena" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="caja-con-cojo">
                <input
                  className='change-password-input' 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setConfirmarContrasena(e.target.value);
                    }
                  }}
                />
                <span className="p-ojo-contrasena" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Mensaje de error */}
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            
            <Modal.Footer>
              <Button onClick={handleSubmitPassword}>Guardar</Button>
              <Button onClick={closeModalContrasena}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

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

        </header>
      
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}

    </div>
  )
}