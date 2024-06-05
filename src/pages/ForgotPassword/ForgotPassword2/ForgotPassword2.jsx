import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword2.css';

export const ForgotPassword2 = () => {

  useEffect(() => {
    document.body.classList.add('register-body');

    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  return (
    <div className='container-register-1'>
      <div className='container-register-2'>
        {/* Titulo */}
        <h2 className='header-register'>Cambio de contraseña</h2>

        <p className='register1-texto-login'>Revisa tu correo para cambiar tu contraseña</p>

        {/* Flechas */}
        <div className='flecha2-register-container'>
          {/* Regreso */}
          <div className='flecha2-register-container-start'>
          </div>

          {/* Regreso a inicio */}
          <div className='flecha2-register-container-end'>
            <Link to='/login'>
              <button type="button">
                Regresar
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}