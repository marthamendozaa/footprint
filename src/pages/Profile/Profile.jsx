import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { getUsuario, updateUsuarioNombre, getHabilidades, getHabilidadesUsuario, actualizaHabilidades, getIntereses, getInteresesUsuario, actualizaIntereses, cerrarSesion, cambiarContrasena } from './Profile-fb.js';
import Usuario from '../../backend/obj-Usuario.js';
import './Profile.css';

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
        const interesesData = await getIntereses();
        setIntereses(interesesData);
  
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


  return (
    <div className="profile-page">
      {habilidades && habilidadesUsuario && intereses && interesesUsuario ? (
        <header className="Profile-header">
          <h1>Mi perfil</h1>
          <div className="profile-info">
            <div className="profile-info-left">
              <div className="Foto-perfil position-relative">
                  <img src={informacionUsuario.urlImagen} className="Foto-perfil img-fluid rounded-circle" alt="perfil" />
                  <FaPen className="edit-icon" />
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