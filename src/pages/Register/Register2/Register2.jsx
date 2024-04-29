import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft, FaUser, FaIdCard, FaCalendar, FaExclamationCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import './Register2.css';

export const Register2 = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedDate, setSelectedDate] = useState(null)
  const [invalidDate, setInvalidDate] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('register2-body');

    return () => {
      document.body.classList.remove('register2-body');
    };
  }, []);

  const validateUsername = (username) => {
    const numbers = /[0-9]/;
    if (!numbers.test(username)) {
        return false;
    }

    return true;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name || !username || !selectedDate) {
      setError('Por favor, llena todos los campos');
      setShowModal(true);
      return;
    }

    if (!validateUsername(username)) {
        setInvalidDate(true);
        return;
    }

    try {
        navigate('/register3');
      } catch {
        setError('Error al registrarse. Por favor, inténtalo de nuevo.');
        setShowModal(true);
      }
  };

  return (
    <div className='container-register2-1'>
      <div className='container-register2-2'>
        <form onSubmit={handleRegister}>
          <div className='container-register2-3'>

            {/* Nombre */}
            <div className='container-nombre-register2'>
              <p className='nombre-texto-register2'>Nombre</p>

              {/* Caja de nombre */}
              <FaIdCard className="register2-icons" />
              <div className="relative">
                <input
                  className={"nombre-caja-register2"}
                  type="nombre"
                  placeholder="Ingresa tu nombre completo"
                  value={name}
                  onChange={(e) => { setName(e.target.value) }}
                />
              </div>
            </div>

            {/* Usuario */}
            <div className='container-usuario-register2'>
              <p className='usuario-texto-register2'>Usuario</p>
            
              {/* Caja usuario */}
              <FaUser className="register2-icons" />
              <input 
                className={`usuario-caja-register2 ${invalidDate ? 'border-red-register2' : ''}`}
                type="usuario"
                placeholder="Ingresa tu usuario" 
                value={username}  
                onChange={(e) => {
                  setUsername(e.target.value)
                  setInvalidDate(false);
                }} 
              />

              {/* Advertencia de usuario */}
              {invalidDate && (
                <div className="custom-alert-register2 bg-custom-color-register2" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register2" />
                  <span>El usuario ya existe</span>
                </div>
              )}
            </div>
            
            {/* Fecha */}
            <div className='container-fecha-register2'>
              <p className='fecha-texto-register2'>Fecha de nacimiento</p>

              {/* Caja de fecha */}
              <FaCalendar className="register2-icons" />
              <DatePicker
                className={"fecha-caja-register2"}
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                placeholderText="Ingresa tu fecha de nacimiento"
                dateFormat="dd/MM/yyyy"
                isClearable={false}
                showYearDropdown
                scrollableYearDropdown 
                yearDropdownItemNumber={66}
                locale={es}
              />
              
            </div>

          </div>

          {/* Flechas */}
          <div className='flecha-register2-container'>

            {/* Regreso */}
            <div className='flecha-register2-container-start'>
              <Link to="/register">
                <button type="button" className="btn flecha-btn">
                  <FaArrowLeft />
                </button>
              </Link>
            </div>

            {/* Continuar con registro */}
            <div className='flecha-register2-container-end'>
              <button type="submit" className="btn flecha-btn">
                <FaArrowRight />
              </button>
            </div>
      
          </div>

        </form>
      </div>
      
      {/* Pop-up de error */}
      {showModal && (
        <div className='pop-up-register2'>
          <div className='pop-up-3-register2'>
            <h2 style={{textAlign: 'center'}}>Error</h2>
            <p style={{textAlign: 'left', marginTop: '20px'}}>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};