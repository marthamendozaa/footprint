import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaArrowLeft, FaExclamationCircle} from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { existeCorreo, enviarCorreoContrasena } from '../../api/api.js';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  // Validaciones
  const [changingEmail, setChangingEmail] = useState(true);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    document.body.classList.add('register-body');

    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  const validateEmail = async () => {
    const emailValid = /^[a-z0-9._-]+@[a-z-]{3,10}\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/.test(email);
    setInvalidEmail(!emailValid);

    if (emailValid) {
      const response = await existeCorreo(email);
      setEmailExists(response);
    }
    
    setChangingEmail(false);
  };

  const handleRegresar = () => {
    navigate('/login');
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setSendingEmail(true);

    try {
      await enviarCorreoContrasena(email);

    } catch (error) {
      console.error(error);
    } finally {
      setSendingEmail(false);
      setEmailSent(true);
    }
  };

  return (
    <div className='container-register-1'>
      <div className='container-register-2'>
        {/* Titulo */}
        <h2 className='header-register'>Cambio de contraseña</h2>

        <form onSubmit={handlePasswordChange}>
          <div className='container-register-3'>

            {/* Email */}
            <div className='container-correo-register' style={{marginTop: '20px'}}>
              <p className='correo-texto-register'>Correo</p>

              {/* Caja de correo */}
              <FaEnvelope className="register-icons" />
              <div className="relative">
                <input
                  className={`correo-caja-register ${!changingEmail && (invalidEmail || !emailExists) ? 'border-red-register' : ''}`}
                  type="correo"
                  placeholder="Ingresa el correo"
                  value={email}
                  onChange={(e) => {
                    if (e.target.value.length <= 40) {
                      setEmail(e.target.value);
                    }
                    setInvalidEmail(false);
                    setEmailExists(false);
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
                {!changingEmail && (invalidEmail || !emailExists) && (
                  <div className="custom-alert-register bg-custom-color-register" style={{ marginTop: '-5px' }}>
                    <FaExclamationCircle className="custom-alert-icon-register" />
                    <span> Correo inválido </span>
                  </div>
                )}
              </div>
            </div>
          </div>
            
          {/* Correo enviado */}
          <div className="f-correo-enviado-container">
            {emailSent && (
              <div className="f-correo-enviado">Revisa tu correo para cambiar la contraseña</div>
            )}
          </div>

          {/* Botones */}
          <div className='f-flecha-register-container'>
            {/* Regreso a inicio */}
            <div className='f-flecha-register-container-start'>
              <button type="submit" className="btn flecha-btn" onClick={handleRegresar}>
                <FaArrowLeft />
              </button>
            </div>
            {/* Continuar con cambio de contraseña */}
            <div className='flecha-register4-container-end'>
              <button type="submit" className="btn flecha-btn" disabled={!email || invalidEmail || !emailExists || emailSent || sendingEmail}>
                {sendingEmail ? <ClipLoader size={24} color="#6b6b6b" /> : 'Enviar'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}