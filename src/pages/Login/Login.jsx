import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { autentificaUsuario, getUsuario } from '../../api/api.js';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaExclamationCircle} from 'react-icons/fa';
import evertechImage from '../../assets/evertech.png';
import './Login.css';

export const Login = () => {
  // Variables
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);

  // Fondo de color
  useEffect(() => {
    // Agregar clase al body al montar el componente
    document.body.classList.add('login-body');

    // Eliminar clase al body al desmontar el componente
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  // Funciones
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z-]{3,10}\.[a-zA-Z]{2,3}(?:\.[a-zA-Z]{2,3})?$/;
    return re.test(String(email).toLowerCase());
  };

  // Autentificación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setAdmin } = useAuth();
  const navigate = useNavigate();

  const [loginBloqueado, setLoginBloqueado] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Correo y contraseña no pueden ser campos vacíos');
      setShowModal(true);
      return;
    }

    if (!validateEmail(email)) {
      setInvalidEmail(true);
      return;
    }

    setLoginBloqueado(true);
    
    try {
      const user = await autentificaUsuario(email, password);
      setUser(user);

      const admin = await getUsuario(user);
      setAdmin(admin.esAdmin);

      if (admin.esAdmin) {
        navigate('/exploreAdmin');
      } else {
        navigate('/explore');
      }
    } catch (error) {
      console.error("Error al hacer login:", error.message);
      setError('Inicio de sesión fallido. Verifica tu correo y contraseña.');
      setShowModal(true);
    } finally {
      setLoginBloqueado(false);
    }
  };

  // Render
  return (
    <div className='container-login-1'>
      <div className='container-login-2'>
        {/* Titulo */}
        <h2 className='header-login'>Login</h2>

        <form onSubmit={handleLogin}>
          <div className='container-login-3'>
            {/* Email */}
            <div className='container-correo'>
              <p className='correo-texto'>Correo</p>

              {/* Caja de correo */}
              <FaUser className="login-icons" />
              <div className="relative">
                <input
                  className={`correo-caja ${invalidEmail ? 'border-red-login' : ''}`}
                  type="correo"
                  placeholder="Ingresa el correo"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setInvalidEmail(false);
                  }}
                />

                {/* Advertencia de correo */}
                {invalidEmail && (
                <div className="custom-alert bg-custom-color">
                  <FaExclamationCircle className='custom-alert-icon'/>
                  <span>Formato de correo inválido</span>
                </div>        
                )}

              </div>
            </div>

            {/* Contraseña */}
            <div className='container-contrasena'>
              <p className='contrasena-texto'>Contraseña</p>
              {/* Ojo */}
              <FaLock className="login-icons" />
              <input 
                className="ojo-contrasena" 
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa la contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              
              <span className="ojo-contrasena-2" onClick={() => setShowPassword(!showPassword)}>
                {password !== '' && (showPassword ? <FaEyeSlash /> : <FaEye />)}
              </span>
            </div>

          </div>

          {/* Parte de abajo */}
          <div className='login-container-final'>
              {/* Cambiar contraseña */}
              <div className='cambiar-contrasena-container'>
                  <button type="button" className="btn login-btn">
                      ¿Olvidaste tu contraseña?
                  </button>
              </div>

              {/* Botón de iniciar sesión */}
              <div className='iniciar-sesion-container'>
                  <button type="submit" className="btn login-btn" disabled={loginBloqueado}>
                      Iniciar sesión
                  </button>
              </div>

              {/* Registrate */}
              <div className='registrarse-container'>
                  <p className='register-texto-login'>¿No tienes cuenta?</p>
                  <Link to='/register'> 
                    <button type="button" className="btn login-btn">
                        Regístrate
                    </button>
                  </Link>
              </div>
          </div>

        </form>
      </div>

      {/* Logo de Evertech */}
      <div className='evertech-login'>
        <img src={evertechImage} alt='Evertech' />
      </div>

      {/* Popup de Error */}
      {showModal && (
        <div className='pop-up'>
          <div className='pop-up-3'>
            <h2 style={{textAlign: 'center'}}>Error</h2>
            <p style={{textAlign: 'left', marginTop: '20px'}}>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}