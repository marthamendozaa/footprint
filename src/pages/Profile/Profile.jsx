import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUsuario, updateUsuarioNombre, getHabilidades, getHabilidadesUsuario, agregaHabilidad, eliminaHabilidad, getIntereses, getInteresesUsuario, agregaInteres, eliminaInteres, cerrarSesion, cambiarContrasena, uploadProfileImage, updateUsuarioImage } from './Profile-fb.js';
import Usuario from '../../backend/obj-Usuario.js';
import Modal from 'react-bootstrap/Modal';
import './Profile.css';

export const Profile = () => {
  const [informacionUsuario, setinformacionUsuario] = useState(new Usuario());
  const [editingNombre, setEditingNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesUsuario, setHabilidadesUsuario] = useState([]);
  const [intereses, setIntereses] = useState([]);
  const [interesesUsuario, setInteresesUsuario] = useState([]);

  const [sesionCerrada, setSesionCerrada] = useState(false);
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      if (!sesionCerrada) {
        const infoUsuario = await getUsuario();
        const objUsuario = { ...informacionUsuario, ...infoUsuario };
        setinformacionUsuario(objUsuario);

        const habilidadesData = await getHabilidades();
        setHabilidades(habilidadesData);

        const habilidadesUsuarioData = await getHabilidadesUsuario();
        setHabilidadesUsuario(habilidadesUsuarioData);

        const interesesData = await getIntereses();
        setIntereses(interesesData);

        const interesesUsuarioData = await getInteresesUsuario();
        setInteresesUsuario(interesesUsuarioData);
      }
    };
    fetchData();
  }, [sesionCerrada]);

  //Cambiar Nombre del perfil
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

  //Editar habilidades
  const botonAgregaHabilidad = async (habilidad, idHabilidad) => {
    await agregaHabilidad(habilidad, idHabilidad);
    const habilidadesUsuarioData = await getHabilidadesUsuario();
    setHabilidadesUsuario(habilidadesUsuarioData);
  };

  const botonEliminaHabilidad = async (idHabilidad) => {
    if (habilidadesUsuario.length === 1) {
      console.log("No se puede eliminar la última habilidad");
      return;
    }
    await eliminaHabilidad(idHabilidad);
    const habilidadesUsuarioData = await getHabilidadesUsuario();
    setHabilidadesUsuario(habilidadesUsuarioData);
  };

  const toggleHabilidad = async (habilidad, idHabilidad) => {
    if (habilidadesUsuario.includes(habilidad)) {
      await botonEliminaHabilidad(idHabilidad);
    } else {
      await botonAgregaHabilidad(habilidad, idHabilidad);
    }
  };

  //Editar intereses
  const botonAgregaInteres = async (interes, idInteres) => {
    await agregaInteres(interes, idInteres);
    const interesesUsuarioData = await getInteresesUsuario();
    setInteresesUsuario(interesesUsuarioData);
  };

  const botonEliminaInteres = async (idInteres) => {
    if (interesesUsuario.length === 1) {
      console.log("No se puede eliminar el últim interés");
      return;
    }
    await eliminaInteres(idInteres);
    const interesesUsuarioData = await getInteresesUsuario();
    setInteresesUsuario(interesesUsuarioData);
  };

  const toggleInteres = async (interes, idInteres) => {
    if (interesesUsuario.includes(interes)) {
      await botonEliminaInteres(idInteres);
    } else {
      await botonAgregaInteres(interes, idInteres);
    }
  };

  const botonCerrarSesion = async () => {
    await cerrarSesion();
    setSesionCerrada(true);
    navigate('/login');
  };

  const handleCancelarCambioContrasena = () => {
    setCambiandoContrasena(false); // Al hacer click en Cancelar, se vuelve a false
  };

  const handleChangePassword = () => {
    setCambiandoContrasena(true);
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

  const openModal = () => {
    setShowModal(true);
  };

  const handleUploadProfileImage = async () => {
    if (selectedImage) {
      try {
        const imageUrl = await uploadProfileImage(selectedImage); // Subir la imagen seleccionada a Firebase Storage
        await updateUsuarioImage(imageUrl); // Actualizar la URL de la imagen en Firebase Database
        const infoUsuario = await getUsuario(); // Obtener la información actualizada del usuario
        setinformacionUsuario(infoUsuario); // Actualizar el estado del usuario con la nueva información
       // closeModal(); // Cerrar el modal después de subir la imagen
      } catch (error) {
        console.error("Error al subir la imagen de perfil:", error.message);
      }
    } else {
      console.log("No se ha seleccionado ninguna imagen");
    }
  };

  return (
    <div className="profile-page">
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
            {habilidades.map((habilidad, idHabilidad) => (
              <li key={idHabilidad} className={`p-etiquetas-item ${habilidadesUsuario.includes(habilidad) ? "highlighted" : ""}`} onClick={() => toggleHabilidad(habilidad, idHabilidad)}>
                {habilidad}
              </li>
            ))}
          </div>
        </div>
        <div className="subtitle skills-interests">
          <h3>Temas de interés</h3> 
          <div className='p-etiquetas'>
            {intereses.map((interes, idInteres) => (
              <li key={idInteres} className={`p-etiquetas-item  ${interesesUsuario.includes(interes) ? "highlighted" : ""}`} onClick={() => toggleInteres(interes, idInteres)}>
                {interes}
              </li>
            ))}
          </div>
        </div>
        <div className="perfil-logout" style={{borderRadius: "18px"}}>
          <button onClick={botonCerrarSesion}>Cerrar Sesión</button>
          </div>
      </header>
    </div>
  )
}