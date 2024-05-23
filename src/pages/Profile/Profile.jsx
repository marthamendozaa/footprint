import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaCog, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { autentificaUsuario, getUsuario, actualizaUsuario, actualizaContrasena, getHabilidades, getIntereses, subirImagen } from '../../api/api.js';
import Usuario from '../../classes/Usuario.js';
import PasswordInfo2 from './PasswordInfo2.jsx';
import './Profile.css';


export const Profile = () => {
  // Cerrar sesión
  const [sesionCerrada, setSesionCerrada] = useState(false);
  const [showModalSesionCerrada, setShowModalSesionCerrada] = useState(false);
  const { user, setUser, setAdmin } = useAuth();
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


  // Información del perfil
  const [usuario, setUsuario] = useState(new Usuario());
  const [habilidades, setHabilidades] = useState(null);
  const [intereses, setIntereses] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!sesionCerrada) {
        const usuarioData = await getUsuario(user);
        const objUsuario = { ...usuario, ...usuarioData };
        setUsuario(objUsuario);

        const habilidadesData = await getHabilidades();
        setHabilidades(habilidadesData);

        const interesesData = await getIntereses();
        setIntereses(interesesData);
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
    setNuevoNombre(usuario.nombre);
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
    
    const usuarioNuevo = { ...usuario, nombre: nuevoNombre };
    setUsuario(usuarioNuevo);
    setEditingNombre(false);
    await actualizaUsuario(usuarioNuevo);
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

      const usuarioNuevo = { ...usuario, nombre: nuevoNombre };
      setUsuario(usuarioNuevo);
      setEditingNombre(false);
      await actualizaUsuario(usuarioNuevo);
    }
  };  

  // Editar habilidades
  const toggleHabilidad = async (habilidad, idHabilidad) => {
    const usuarioNuevo = { ...usuario };

    if (Object.keys(usuarioNuevo.listaHabilidades).includes(`${idHabilidad}`)) {
      if (Object.keys(usuarioNuevo.listaHabilidades).length === 1) {
        const errorMessage = 'Debes tener al menos una habilidad';
        openModalError(errorMessage);
        return;
      }
      delete usuarioNuevo.listaHabilidades[idHabilidad];
    } else {
      usuarioNuevo.listaHabilidades[idHabilidad] = habilidad;
    }
    
    setUsuario(usuarioNuevo);
    await actualizaUsuario(usuarioNuevo);
  };
  

  // Editar intereses
  const toggleInteres = async (interes, idInteres) => {
    const usuarioNuevo = { ...usuario };

    if (Object.keys(usuarioNuevo.listaIntereses).includes(`${idInteres}`)) {
      if (Object.keys(usuarioNuevo.listaIntereses).length === 1) {
        const errorMessage = 'Debes tener al menos un interés';
        openModalError(errorMessage);
        return;
      }
      delete usuarioNuevo.listaIntereses[idInteres];
    } else {
      usuarioNuevo.listaIntereses[idInteres] = interes;
    }
  
    setUsuario(usuarioNuevo);
    await actualizaUsuario(usuarioNuevo);
  };


  // Cambiar contraseña
  const [showModalContrasena, setShowModalContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorNuevaContraseña, setErrorNuevaContraseña] = useState('');
  const [errorConfirmarContraseña, setErrorConfirmarContraseña] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const openModalContrasena = () => {
    setShowModalContrasena(true);
  };

  const closeModalContrasena = () => {
    setShowModalContrasena(false);
    setContrasenaActual('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorNuevaContraseña('');
    setErrorConfirmarContraseña('');
    setError('');
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
        return false;
    }

    const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (!specialCharacters.test(password)) {
        return false;
    }

    const numbers = /[0-9]/;
    if (!numbers.test(password)) {
        return false;
    }

    const upperCaseLetters = /[A-Z]/;
    if (!upperCaseLetters.test(password)) {
        return false;
    }

    return true;
  };

  const handleSubmitPassword = async () => {
    event.preventDefault();

    if (contrasenaActual.trim() === '' || nuevaContrasena.trim() === '' || confirmarContrasena.trim() === '') {
      setError('Por favor, llena todos los campos');
      return;
    }

    if (!validatePassword(nuevaContrasena)) {
      setErrorNuevaContraseña('Formato de contraseña inválido');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorConfirmarContraseña('Las contraseñas no coinciden');
      return;
    }

    try {
      // Si la contraseña se cambió con éxito, limpiar los campos y el estado de error
      await autentificaUsuario(usuario.correo, contrasenaActual);
      await actualizaContrasena(user, nuevaContrasena);
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setErrorNuevaContraseña('');
      setErrorConfirmarContraseña('');
      setError('');
      setShowModalContrasena(false);

    } catch (error) {
      setError('Error: Contraseña no cambiada');
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
    setSelectedImage(null);
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
    setSelectedImage(null);
    return;
  }
  
    try {
      const imageUrl = await subirImagen(selectedImage, `Usuarios/${user}`);
      const usuarioNuevo = { ...usuario, urlImagen: imageUrl };
      setUsuario(usuarioNuevo);
      await actualizaUsuario(usuarioNuevo);
      closeModal();
    } catch (error) {
      console.error("Error al subir la imagen de perfil:", error.message);
    }
  };

  // React Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedImage(acceptedFiles[0]);
        setErrorI('');
      }
    }
  });

  return (
    <div className="profile-page">
      {/* Spinner */}
      {usuario && habilidades && intereses ? (
        <header className="profile-header">
          {/* Titulo */}
          <h1>Mi perfil</h1>

          {/* Información del usuario */}
          <div className="profile-info">

            {/* Info foto */}
            <div className="profile-info-left">
              {/* Foto de perfil */}
              <div className="p-foto" onClick={handleImageClick}>
                <img src={usuario.urlImagen} className="p-preview-imagen"/>
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
                    usuario.nombre
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
                  <p> <span> Edad: </span> {usuario.edad} años</p>
                </div>

                {/* Usuario */}
                <div className="profile-icons-text">
                  <FaUser className="profile-icons-text-icon"/> 
                  <span> Usuario: </span> 
                  <p> 
                    {usuario.nombreUsuario} 
                  </p>
                </div>
                
                {/* Correo */}
                <div className="profile-icons-text">
                  <FaEnvelope className="profile-icons-text-icon"/> 
                  <span> Correo: </span> 
                  <p className='p-correo'> 
                    {usuario.correo}
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
                <li key={idInteres} className={`p-etiquetas-item  ${Object.values(usuario.listaIntereses).includes(interes) ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
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
                <li key={idHabilidad} className={`p-etiquetas-item ${Object.values(usuario.listaHabilidades).includes(habilidad) ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                  {habilidad}
                </li>
              ))}
            </div>
          </div>

          {/* Botón para cerrar sesión */}
          <div className="perfil-logout" style={{borderRadius: "18px"}}>
            <button onClick={openModalSesionCerrada}> <FaCog className='p-fa-gear' /> Cerrar Sesión</button>
          </div>

          {/* ----- Modales ----- */}
          
          {/* Modal para subir imagen */}
          <Modal className="p-modal" show={showModal} onHide={closeModal}>
            <Modal.Header>
              <div className='p-modal-title'>Foto de perfil</div>
            </Modal.Header>
            
            <div className="p-input-body">
              <div {...getRootProps({ className: 'p-custom-file-button' })}>
                <input {...getInputProps()} />
                Subir foto
              </div>
              <span className="p-custom-file-text">{selectedImage ? selectedImage.name : "Ninguna imagen seleccionada"}</span>
            </div>
            {errorI && <span className='p-error-imagen'><FaExclamationCircle className='p-fa-ec'/>{errorI}</span>}
      
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
                  className={`change-password-input ${contrasenaActual.trim() === '' && error ? 'p-borde-rojo' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setContrasenaActual(e.target.value);
                    }
                    setError('');
                  }} 
                />
                <span className="p-ojo-contrasena" onClick={() => setShowPassword(!showPassword)}>
                  {contrasenaActual !== '' && (showPassword ? <FaEyeSlash /> : <FaEye />)}
                </span>
              </div>

              {/* Nueva contraseña */}
              <div className="caja-con-cojo">
                <input
                  className={`change-password-input ${((nuevaContrasena.trim() === '' && error) || errorNuevaContraseña) ? 'p-borde-rojo' : ''}`}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setNuevaContrasena(e.target.value);
                    }
                    setErrorNuevaContraseña('');
                    setError('');
                  }} 
                />
                
                <div className="p-row-dos-iconos">
                  <PasswordInfo2 className="p-p-i"/>
                  <span className="p-ojo-contrasena" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {nuevaContrasena !== '' && (showNewPassword ? <FaEyeSlash /> : <FaEye />)}
                  </span>
                </div>

              </div>
              {errorNuevaContraseña && <p className='p-error-cc' style={{marginTop: '-40px'}}><FaExclamationCircle className='p-fa-ec-2'/>{errorNuevaContraseña}</p>}

              {/* Confirmar nueva contraseña */}
              <div className="caja-con-cojo">
                <input
                  className={`change-password-input ${((confirmarContrasena.trim() === '' && error) || errorConfirmarContraseña) ? 'p-borde-rojo' : ''}`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setConfirmarContrasena(e.target.value);
                    }
                    setErrorConfirmarContraseña('');
                    setError('');
                  }}
                />
                <span className="p-ojo-contrasena" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {confirmarContrasena !== '' && (showConfirmPassword ? <FaEyeSlash /> : <FaEye />)}
                </span>
              </div>
              {errorConfirmarContraseña && <p className='p-error-cc' style={{marginTop: '-40px'}}><FaExclamationCircle className='p-fa-ec-2'/>{errorConfirmarContraseña}</p>}
            </div>
            {error && <p className='p-error-cc' style={{marginTop: '310px'}}><FaExclamationCircle className='p-fa-ec-2'/>{error}</p>}
            
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