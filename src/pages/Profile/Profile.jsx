import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getUsuario, actualizaUsuario, getHabilidades, getIntereses } from '../../api/api.js';
import { cambiarContrasena, uploadProfileImage, deleteProfileImage } from './Profile-fb.js';
import Usuario from '../../backend/obj-Usuario.js';
import Modal from 'react-bootstrap/Modal';
import './Profile.css';


export const Profile = () => {
  // Cerrar sesión
  const [sesionCerrada, setSesionCerrada] = useState(false);
  const { user, setUser, setAdmin } = useAuth();
  const navigate = useNavigate();

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


  // Cambiar nombre del perfil
  const [editingNombre, setEditingNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const handleNombreEdit = () => {
    setEditingNombre(true);
    setNuevoNombre(usuario.nombre);
  };

  const handleNombreChange = (event) => {
    setNuevoNombre(event.target.value);
  };

  const handleNombreSubmit = async () => {
    const usuarioNuevo = { ...usuario, nombre: nuevoNombre };
    setUsuario(usuarioNuevo);
    setEditingNombre(false);
    await actualizaUsuario(user, usuarioNuevo);
  };
  

  // Editar habilidades
  const toggleHabilidad = async (habilidad, idHabilidad) => {
    const usuarioNuevo = { ...usuario };

    if (Object.keys(usuarioNuevo.listaHabilidades).includes(`${idHabilidad}`)) {
      if (Object.keys(usuarioNuevo.listaHabilidades).length === 1) {
        alert("Debes tener al menos una habilidad");
        return;
      }
      delete usuarioNuevo.listaHabilidades[idHabilidad];
    } else {
      usuarioNuevo.listaHabilidades[idHabilidad] = habilidad;
    }
    
    setUsuario(usuarioNuevo);
    await actualizaUsuario(user, usuarioNuevo);
  };
  

  // Editar intereses
  const toggleInteres = async (interes, idInteres) => {
    const usuarioNuevo = { ...usuario };

    if (Object.keys(usuarioNuevo.listaIntereses).includes(`${idInteres}`)) {
      if (Object.keys(usuarioNuevo.listaIntereses).length === 1) {
        alert("Debes tener al menos un interés");
        return;
      }
      delete usuarioNuevo.listaIntereses[idInteres];
    } else {
      usuarioNuevo.listaIntereses[idInteres] = interes;
    }
  
    setUsuario(usuarioNuevo);
    await actualizaUsuario(user, usuarioNuevo);
  };


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
      const usuarioNuevo = { ...usuario, urlImagen: imageUrl };
      setUsuario(usuarioNuevo);
      await actualizaUsuario(user, usuarioNuevo);
      closeModal();
    } catch (error) {
      console.error("Error al subir la imagen de perfil:", error.message);
    }
  };

  return (
    <div className="profile-page">
      {/* Spinner */}
      {usuario && habilidades && intereses ? (
        <header className="Profile-header">
          {/* Titulo */}
          <h1>Mi perfil</h1>

          {/* Información del usuario */}
          <div className="profile-info">

            {/* Info foto */}
            <div className="profile-info-left">
              {/* Foto de perfil */}
              <div className="Foto-perfil position-relative">
                <img src={usuario.urlImagen} className="Foto-perfil img-fluid rounded-circle" alt="perfil" />
                <FaPen className="edit-icon" onClick={openModal} />
              
                {/* Modal para subir imagen */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                  {/* Botón para cerrar el modal + titulo */}
                  <Modal.Header closeButton>
                    <Modal.Title className='p-modaltitle'>Foto de perfil</Modal.Title>
                  </Modal.Header>
                  
                  {/* Subir imagen */}
                  <Modal.Body className='p-modalinfo'>
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                    {errorI && <p style={{ color: 'red' }}>{errorI}</p>}
                  </Modal.Body>
                  
                  {/* Botón para guardar la imagen */}
                  <Modal.Footer>
                    <button variant="secondary" onClick={handleUploadProfileImage}>
                      Guardar Imagen
                    </button>
                  </Modal.Footer>
                </Modal>

              </div>
            </div>

            {/* Información a lado de la foto */}
            <div className="profile-info-right">
              {/* Nombre del usuario */}
              <div className="name-container">
                <h2>
                  {/* Nombre del usuario */}
                  {editingNombre ? (
                    <input
                      type="text"
                      value={nuevoNombre}
                      onChange={handleNombreChange}
                    />
                  ) : (
                    usuario.nombre
                  )}

                  {/* Botón para editar el nombre */}
                  {!editingNombre && (
                    <button className="edit-profile-btn" onClick={handleNombreEdit}>
                      <FaPen />
                    </button>
                  )}

                  {/* Botón para guardar el nombre */}
                  {editingNombre && (
                    <button className="edit-profile-btn guardar" onClick={handleNombreSubmit}>
                      Guardar
                    </button>
                  )}
                </h2>
              </div>
              
              {/* Edad */}
              <p>{usuario.edad} años</p>

              {/* Usuario */}
              <h3>{usuario.nombreUsuario} </h3>

              {/* Correo */}
              <p>{usuario.correo} </p>

              {/* Cambiar contraseña */}
              <p className="change-password" onClick={handleChangePassword}>Cambiar contraseña</p>
              {cambiandoContrasena && (
                <form className="change-password-form" onSubmit={handleSubmitPassword}>
                  {/* Contraseña actual */}
                  <input
                    className='change-password-input' type="password"
                    placeholder="Contraseña actual"
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
                  />

                  {/* Nueva contraseña */}
                  <input
                    className='change-password-input' type="password"
                    placeholder="Nueva contraseña"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                  />

                  {/* Confirmar nueva contraseña */}
                  <input
                    className='change-password-input' type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                  />

                  {/* Botones para cancelar o guardar */}
                  <button className="change-password-cancel" type="button" onClick={handleCancelarCambioContrasena}>Cancelar</button>
                  <button className='change-password-submit' type="submit">Guardar</button>

                  {/* Mensaje de error */}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
              )}

            </div>
          </div>

          {/* Habilidades */}
          <div className="subtitle skills-interests">
            <h3>Habilidades</h3>
            <div className='p-etiquetas'>
              {Object.values(habilidades).map((habilidad, idHabilidad) => (
                <li key={idHabilidad} className={`p-etiquetas-item ${Object.values(usuario.listaHabilidades).includes(habilidad) ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                  {habilidad}
                </li>
              ))}
            </div>
          </div>

          {/* Intereses */}
          <div className="subtitle skills-interests">
            <h3>Temas de interés</h3> 
            <div className='p-etiquetas'>
              {Object.values(intereses).map((interes, idInteres) => (
                <li key={idInteres} className={`p-etiquetas-item  ${Object.values(usuario.listaIntereses).includes(interes) ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
                  {interes}
                </li>
              ))}
            </div>
          </div>

          {/* Botón para cerrar sesión */}
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