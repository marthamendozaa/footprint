import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaUser, FaIdCard, FaCalendar, FaExclamationCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import DateInfo from './DateInfo.jsx';
import { ResponsiveLetter } from './ResponsiveLetter.jsx';
import { existeNombreUsuario } from '../../../api/api.js';
import './Register2.css';

export const Register2 = ({ onPrev, onNext }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [invalidName, setInvalidName] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResponsiveLetter, setShowResponsiveLetter] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    document.body.classList.add('register2-body');

    return () => {
      document.body.classList.remove('register2-body');
    };
  }, []);

  const onlyLetters = (text) => {
    return /^[a-zA-ZñÑáéíóúüÁÉÍÓÚ\s]+$/.test(text);
  };

  const calculateAge = (birthday) => {
    const currentDate = new Date();
    const birthDate = new Date(birthday);
    
    let ageDiff = currentDate - birthDate;
  
    let ageDate = new Date(ageDiff); 
    let calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  
    return calculatedAge;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name || !username || !selectedDate) {
      setError('Por favor, llena todos los campos');
      setShowModal(true);
      return;
    }

    if (!onlyLetters(name)) {
      setInvalidName(true);
      return;
    }

    const response = await existeNombreUsuario(username);
    if (response) {
      setInvalidUsername(true);
      return;
    }

    try {
        const userAge = calculateAge(selectedDate);

        if (isChecked==true) {  
          onNext();
        }

        if (userAge<18) {
            setShowResponsiveLetter(true)
            return;
        }

        else {
            onNext();
        }
        
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
                  className={`nombre-caja-register2 ${invalidName ? 'border-red-register2' : ''}`}
                  type="nombre"
                  placeholder="Ingresa tu nombre completo"
                  value={name}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setName(e.target.value);
                    }
                    setInvalidName(false);
                  }} 
                />
              </div>

              {/* Advertencia de usuario */}
              {invalidName && (
                <div className="custom-alert-register2 bg-custom-color-register2" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register2" />
                  <span>Formato de nombre inválido</span>
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className='container-usuario-register2'>
              <p className='usuario-texto-register2'>Usuario</p>
            
              {/* Caja usuario */}
              <FaUser className="register2-icons" />
              <input 
                className={`usuario-caja-register2 ${invalidUsername ? 'border-red-register2' : ''}`}
                type="usuario"
                placeholder="Ingresa tu usuario" 
                value={username}  
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    setUsername(e.target.value);
                  }
                  setInvalidUsername(false);
                }} 
              />

              {/* Advertencia de usuario */}
              {invalidUsername && (
                <div className="custom-alert-register2 bg-custom-color-register2" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register2" />
                  <span>El usuario ya existe</span>
                </div>
              )}
            </div>
            
            {/* Fecha */}
            <div className='container-fecha-register2'>
              <div className='container-fecha-register2-2'>
                <p className='fecha-texto-register2'>Fecha de nacimiento</p>
                {/* Info de fecha */}
                <DateInfo />
              </div>

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
                showMonthDropdown
                locale={es}
                maxDate={maxDate}
              />
            </div>

          </div>

          {/* Flechas */}
          <div className='flecha-register2-container'>

            {/* Regreso */}
            <div className='flecha-register2-container-start'>
              <button type="button" className="btn flecha-btn" onClick={onPrev}>
                <FaArrowLeft />
              </button>
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

      {/* Popup de Carta Resonsiva */}
      {showResponsiveLetter && <ResponsiveLetter isChecked={isChecked} setIsChecked={setIsChecked} onClose={() => setShowResponsiveLetter(false)} />}
      
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