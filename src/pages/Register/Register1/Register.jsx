import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { PrivacyPolicy } from './PrivacyPolicy.jsx';
import './Register.css';

export const Register = () => {
  {/* Variables */}
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword2, setShowPassword2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  {/* Funciones */}
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleRegister1 = async (event) => {
    event.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError('Correo, contraseña, y confirmar contraseña no pueden ser campos vacíos');
      setShowModal(true);
      return;
    }

    if (!validateEmail(email)) {
      setInvalidEmail(true);
      return;
    }

    try {
      navigate('/register2');
    } catch {
      setError('Registro fallido. Verifica tus datos.');
      setShowModal(true);
    }
  };

  return (
    <div className="container-register">
      <div className="square-main">
        {/* Titulo */}
        <h2 className='header-register'>Registro</h2>

        <form onSubmit={handleRegister1}>
          {/* Email */}
          <div className='container-email-register'>
            <p className='correo-texto-register'>Correo</p>

            {/* Caja de correo */}
            <div className="relative">
              <input
                className={`correo-caja-register ${invalidEmail ? 'border-red-500' : ''}`}
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
                <div className="absolute left-0 mt-1 bg-white bg-opacity-0 p-1 rounded flex items-center">
                  <FaExclamationCircle className="text-red-500 text-base mr-2" />
                  <span className="text-red-500 text-base">Formato de correo inválido</span>
                </div>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className='container-contrasena-register'>
            <p className='contrasena-texto-register'>Contraseña</p>
            <div className="relative" style={{ marginLeft: "50px" }}>
              {/* Ojo */}
              <input
                className="ojo-contrasena-register"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
              <span className="ojo-contrasena-2-register" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className='container-contrasena-register'>
            <p className='contrasena-texto-register'>Confirmar Contraseña</p>
            <div className="relative" style={{ marginLeft: "50px" }}>
              {/* Ojo */}
              <input
                className="ojo-contrasena-register"
                type={showPassword2 ? 'text' : 'password'}
                placeholder="Ingresa la contraseña de nuevo"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <span className="ojo-contrasena-2-register" onClick={() => setShowPassword2(!showPassword2)}>
                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Flechas */}
          <div className='flecha-register-container'>

            {/* Regreso */}
            <div className='flecha-register-container-start'>
              <Link to="/login">
                <button type="button" className="btn flecha-btn">
                  <FaArrowLeft />
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
        <button className='boton-politicas-privacidad' onClick={() => setShowPrivacyPolicy(true)}>Políticas de Privacidad</button>
      </div>
      

      {/* Popup de Políticas de Privacidad */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}

      {/* Popup de Error */}
      {showModal && (
        <div className='pop-up-register'>
          <div className='pop-up-register-3'>
            <h2 style={{textAlign: 'center'}}>Error</h2>
            <p style={{textAlign: 'left', marginTop: '20px'}}>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
};