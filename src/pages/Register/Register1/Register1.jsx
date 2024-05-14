import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowRight, FaLock, FaEye, FaEyeSlash, FaExclamationCircle} from 'react-icons/fa';
import { PrivacyPolicy } from './PrivacyPolicy.jsx';
import PasswordInfo from './PasswordInfo.jsx';
import { existeCorreo } from '../../../api/api.js';
import './Register1.css';

export const Register1 = ({ onNext, usuario }) => {
  const [email, setEmail] = useState(usuario.correo ? usuario.correo : '');
  const [password, setPassword] = useState(usuario.contrasena ? usuario.contrasena : '');
  const [confirmPassword, setConfirmPassword] = useState(usuario.contrasena ? usuario.contrasena : '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [invalidPassword, setInvalidPasswordl] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    document.body.classList.add('register-body');

    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  const validateEmail = (email) => {
    if (email.length < 8) {
      return false;
    }
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z-]{3,10}\.[a-zA-Z]{2,3}(?:\.[a-zA-Z]{2,3})?$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // Verificar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
        return false;
    }

    // Verificar si la contraseña contiene al menos un carácter especial
    const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (!specialCharacters.test(password)) {
        return false;
    }

    // Verificar si la contraseña contiene al menos un número
    const numbers = /[0-9]/;
    if (!numbers.test(password)) {
        return false;
    }

    // Verificar si la contraseña contiene al menos una letra mayúscula
    const upperCaseLetters = /[A-Z]/;
    if (!upperCaseLetters.test(password)) {
        return false;
    }

    // Si la contraseña pasa todas las validaciones, retorna true
    return true;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError('Por favor, llena todos los campos');
      setShowModal(true);
      return;
    }

    if (!validateEmail(email)) {
      setInvalidEmail(true);
      return;
    }

    const response = await existeCorreo(email);
    if (response) {
      setDuplicateEmail(true);
      return;
    }

    if (!validatePassword(password)) {
      setInvalidPasswordl(true);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    try {
      usuario.correo = email;
      usuario.contrasena = password;
      onNext(usuario);
    } catch {
      setError('Error al registrarse. Por favor, inténtalo de nuevo.');
      setShowModal(true);
    }
  };

  return (
    <div className='container-register-1'>
      <div className='container-register-2'>
        {/* Titulo */}
        <h2 className='header-register'>Registro</h2>

        <form onSubmit={handleRegister}>
          <div className='container-register-3'>

            {/* Email */}
            <div className='container-correo-register'>
              <p className='correo-texto-register'>Correo</p>

              {/* Caja de correo */}
              <FaEnvelope className="register-icons" />
              <div className="relative">
                <input
                  className={`correo-caja-register ${invalidEmail || duplicateEmail ? 'border-red-register' : ''}`}
                  type="correo"
                  placeholder="Ingresa el correo"
                  value={email}
                  onChange={(e) => {
                    if (e.target.value.length <= 40) {
                      setEmail(e.target.value);
                    }
                    setInvalidEmail(false);
                    setDuplicateEmail(false);
                  }}
                />

                {/* Advertencia de correo */}
                {(invalidEmail || duplicateEmail) && (
                  <div className="custom-alert-register bg-custom-color-register" style={{ marginTop: '-5px' }}>
                    <FaExclamationCircle className="custom-alert-icon-register" />
                    <span>
                      {invalidEmail ? 'Formato de correo inválido' : ''}
                      {duplicateEmail ? 'El correo ya está en uso' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contraseña */}
            <div className='container-contrasena-register'>
              <div className='container-contrasena-register-2'>
                <p className='contrasena-texto-register'>Contraseña</p>
                {/* Info de contraseña */}
                <PasswordInfo />
              </div>

              {/* Ojo */}
              <FaLock className="register-icons" />
              <input 
                className={`ojo-contrasena-register ${invalidPassword ? 'border-red-register' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa la contraseña" 
                value={password}
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    setPassword(e.target.value);
                  }
                  setInvalidPasswordl(false);
                }} 
              />
              <span className="ojo-contrasena-2-register" onClick={() => setShowPassword(!showPassword)}>
                {password !== '' && (showPassword ? <FaEyeSlash /> : <FaEye />)}
              </span>

              {/* Advertencia de contraseña */}
              {invalidPassword && (
                <div className="custom-alert-register bg-custom-color-register" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register" />
                  <span>Formato de contraseña inválido</span>
                </div>
              )}
            </div>
            
            {/* Confirmar Contraseña */}
            <div className='container-contrasena-register'>
              <p className='contrasena-texto-register'>Confirmar Contraseña</p>
              
              {/* Ojo */}
              <FaLock className="register-icons" />
              <input 
                className={`ojo-contrasena-register ${!passwordsMatch ? 'border-red-register' : ''}`}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma la contraseña" 
                value={confirmPassword} 
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    setConfirmPassword(e.target.value);
                  }
                  setPasswordsMatch(true);
                }} 
              />
              <span className="ojo-contrasena-2-register" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {confirmPassword !== '' && (showConfirmPassword ? <FaEyeSlash /> : <FaEye />)}
              </span>

              {/* Advertencia de contraseñas no coinciden */}
              {!passwordsMatch && (
                <div className="custom-alert-register bg-custom-color-register" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register" />
                  <span>Las contraseñas no coinciden</span>
                </div>
              )}
            </div>
          </div>

          {/* Flechas */}
          <div className='flecha-register-container'>

            {/* Regreso */}
            <div className='flecha-register-container-start'>
              <p className='register1-texto-login'>¿Ya tienes cuenta?</p>
              <Link to="/login">
                <button type="button" className="btn flecha-btn">
                  Inicia sesión
                </button>
              </Link>
            </div>

            {/* Continuar con registro */}
            <div className='flecha-register-container-end'>
              <button type="submit" className="btn flecha-btn">
                <FaArrowRight />
              </button>
            </div>
      
          </div>

        </form>
      </div>

      {/* Botón de Políticas de Privacidad */}
      <div className='politicas-contenedor'> 
        <p>Al registrarte aceptas nuestras</p>
        <button className='boton-politicas-privacidad' onClick={() => setShowPrivacyPolicy(true)}>políticas de privacidad y uso</button>
      </div>
      
      {/* Popup de Políticas de Privacidad */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      
      {/* Pop-up de error */}
      {showModal && (
        <div className='pop-up-register'>
          <div className='pop-up-3-register'>
            <h2 style={{textAlign: 'center'}}>Error</h2>
            <p style={{textAlign: 'left', marginTop: '20px'}}>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}