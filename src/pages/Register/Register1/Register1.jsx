import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowRight, FaLock, FaEye, FaEyeSlash, FaExclamationCircle} from 'react-icons/fa';
import PasswordStrengthBar from 'react-password-strength-bar';
import { PrivacyPolicy } from './PrivacyPolicy.jsx';
import { existeCorreo } from '../../../api/api.js';
import './Register1.css';

export const Register1 = ({ onNext, usuario }) => {
  const [email, setEmail] = useState(usuario.correo ? usuario.correo : '');
  const [password, setPassword] = useState(usuario.contrasena ? usuario.contrasena : '');
  const [confirmPassword, setConfirmPassword] = useState(usuario.contrasena ? usuario.contrasena : '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Validaciones
  const [fieldsEmpty, setFieldsEmpty] = useState(true);
  const [changingEmail, setChangingEmail] = useState(true);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    document.body.classList.add('register-body');

    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  useEffect(() => {
    if (!email || !password || !confirmPassword) {
      setFieldsEmpty(true);
    } else {
      setFieldsEmpty(false);
    }
  }, [email, password, confirmPassword]);

  const validateEmail = async () => {
    const emailValid = /^[a-z0-9._-]+@[a-z-]{3,10}\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/.test(email);
    setInvalidEmail(!emailValid);

    if (emailValid) {
      const response = await existeCorreo(email);
      setDuplicateEmail(response);
    }
    
    setChangingEmail(false);
  };

  const handleStrengthChange = (score) => {
    setPasswordStrength(score);
  };

  const handlePasswordMatch = () => {
    if (password && confirmPassword) {
      if (password === confirmPassword) {
        setPasswordsMatch(true);
      } else {
        setPasswordsMatch(false);
      }
    } else {
      setPasswordsMatch(true);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    usuario.correo = email;
    usuario.contrasena = password;
    onNext(usuario);
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
                    setChangingEmail(true);
                  }}
                  onBlur={validateEmail}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      validateEmail();
                    }
                  }}
                />

                {/* Advertencia de correo */}
                {(!changingEmail && invalidEmail || duplicateEmail) && (
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
              </div>

              {/* Ojo */}
              <FaLock className="register-icons" />
              <div>
                <div style={{display: "flex", position: "relative"}}>
                  <input 
                    className={`ojo-contrasena-register`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa la contraseña" 
                    value={password}
                    onChange={(e) => {
                      if (e.target.value.length <= 20) {
                        setPassword(e.target.value);
                      }
                    }}
                    onBlur={handlePasswordMatch}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordMatch();
                      }
                    }}
                  />

                  <span className="ojo-contrasena-2-register" style={{height: "100%"}} onClick={() => setShowPassword(!showPassword)}>
                    {password !== '' && (showPassword ? <FaEyeSlash /> : <FaEye />)}
                  </span>                  

                </div>
                  {password.length > 0 && 
                    <PasswordStrengthBar style={{position: "absolute", width: "100%"}}
                      className="password-strength-bar"
                      password={password}
                      onChangeScore={handleStrengthChange}
                      shortScoreWord="Muy corta"
                      scoreWords={["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"]}
                    />
                  }
              </div>
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
                  
                }}
                onBlur={handlePasswordMatch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordMatch();
                  }
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
              <button type="submit" className="btn flecha-btn" disabled={fieldsEmpty || invalidEmail || duplicateEmail || passwordStrength < 4 || !passwordsMatch}>
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
    </div>
  )
}