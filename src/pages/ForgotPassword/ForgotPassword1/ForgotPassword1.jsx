import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaArrowLeft, FaArrowRight, FaExclamationCircle} from 'react-icons/fa';
import { existeCorreo } from '../../../api/api.js';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import './ForgotPassword1.css';

export const ForgotPassword1 = ({ onNext, usuario }) => {
  const [email, setEmail] = useState(usuario.correo ? usuario.correo : '');
  
  // Validaciones
  const [fieldsEmpty, setFieldsEmpty] = useState(true);
  const [changingEmail, setChangingEmail] = useState(true);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  useEffect(() => {
    document.body.classList.add('register-body');

    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  useEffect(() => {
    if (!email) {
      setFieldsEmpty(true);
    } else {
      setFieldsEmpty(false);
    }
  }, [email]);

  const validateEmail = async () => {
    const emailValid = /^[a-z0-9._-]+@[a-z-]{3,10}\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/.test(email);
    setInvalidEmail(!emailValid);

    if (emailValid) {
      const response = await existeCorreo(email);
      setDuplicateEmail(response);
    }
    
    setChangingEmail(false);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    usuario.correo = email;

    const auth = getAuth();
    sendPasswordResetEmail(auth, usuario.correo)
    .then(() => {
      alert("Revise su correo para cambiar su contraseña");
    })
    .catch((error) =>{
      console.error("Error enviando correo")
    })
    onNext(usuario);
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
                  className={`correo-caja-register ${invalidEmail ? 'border-red-register' : ''}`}
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
                {(!changingEmail && invalidEmail || !duplicateEmail) && (
                  <div className="custom-alert-register bg-custom-color-register" style={{ marginTop: '-5px' }}>
                    <FaExclamationCircle className="custom-alert-icon-register" />
                    <span>
                      {invalidEmail || !duplicateEmail ? 'Formato de correo inválido' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p style={{marginLeft: '50px', marginRight: '50px', marginTop: '50px',textAlign: 'left'}}>Se te enviará un código para cambiar tu contraseña</p>

          </div>
          
          <div className="divider"></div>

          {/* Botones */}
          <div className='flecha-register-container'>
            {/* Regreso a inicio */}
            <div className='flecha-register-container-start'>
              <Link to='/login'>
                <button type="button" className="btn flecha-btn">
                  Regresar
                </button>
              </Link>
            </div>
            {/* Continuar con cambio de contraseña */}
            <div className='flecha-register-container-end'>
              <button type="submit" className="btn flecha-btn" disabled={fieldsEmpty || invalidEmail || !duplicateEmail }>
                <FaArrowRight />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}