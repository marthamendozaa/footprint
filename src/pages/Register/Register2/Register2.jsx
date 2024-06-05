import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaUser, FaIdCard, FaCalendar, FaExclamationCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import DateInfo from './DateInfo.jsx';
import { ResponsiveLetter } from './ResponsiveLetter.jsx';
import { existeNombreUsuario } from '../../../api/api.js';
import './Register2.css';

export const Register2 = ({ onPrev, onNext, usuario }) => {
  const [name, setName] = useState(usuario.nombre ? usuario.nombre : '');
  const [username, setUsername] = useState(usuario.nombreUsuario ? usuario.nombreUsuario : '');
  const [selectedDate, setSelectedDate] = useState(usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento) : null);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
  const [showResponsiveLetter, setShowResponsiveLetter] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Validaciones
  const [fieldsEmpty, setFieldsEmpty] = useState(true);
  const [changingName, setChangingName] = useState(true);
  const [invalidName, setInvalidName] = useState(false);
  const [changingUsername, setChangingUsername] = useState(true);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [duplicateUsername, setDuplicateUsername] = useState(false);

  useEffect(() => {
    document.body.classList.add('register2-body');

    return () => {
      document.body.classList.remove('register2-body');
    };
  }, []);

  useEffect(() => {
    if (!name || !username || !selectedDate) {
      setFieldsEmpty(true);
    } else {
      setFieldsEmpty(false);
    }
  }, [name, username, selectedDate]);

  const validateName = () => {
    const nameValid = /^[a-zA-ZñÑáéíóúüÁÉÍÓÚ\s]+$/.test(name);
    setInvalidName(!nameValid);
    setChangingName(false);
  };

  const validateUsername = async () => {
    const usernameValid = /^[a-zA-Z0-9_]+$/.test(username);
    setInvalidUsername(!usernameValid);

    if (usernameValid) {
      const response = await existeNombreUsuario(username);
      setDuplicateUsername(response);
    }
    
    setChangingUsername(false);
  }

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
    const userAge = calculateAge(selectedDate);

    if (userAge < 18) {
      if (isChecked == true) {
        usuario.nombre = name;
        usuario.nombreUsuario = username;
        usuario.fechaNacimiento = selectedDate;
        usuario.edad = userAge;
        onNext(usuario);
      }
      setShowResponsiveLetter(true)
      return;
    }
    else {
      usuario.nombre = name;
      usuario.nombreUsuario = username;
      usuario.fechaNacimiento = selectedDate;
      usuario.edad = userAge;
      onNext(usuario);
    }
  };

  const handlePrev = () => {
    usuario.nombre = name;
    usuario.nombreUsuario = username;
    usuario.fechaNacimiento = selectedDate;
    onPrev(usuario);
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
                    setChangingName(true);
                  }}
                  onBlur={validateName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      validateName();
                    }
                  }}
                />
              </div>

              {/* Advertencia de usuario */}
              {!changingName && invalidName && (
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
                className={`usuario-caja-register2 ${invalidUsername || duplicateUsername ? 'border-red-register2' : ''}`}
                type="usuario"
                placeholder="Ingresa tu usuario" 
                value={username}  
                onChange={(e) => {
                  if (e.target.value.length <= 15) {
                    setUsername(e.target.value);
                  }
                  setInvalidUsername(false);
                  setDuplicateUsername(false);
                  setChangingUsername(true);
                }}
                onBlur={validateUsername}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    validateUsername();
                  }
                }}
              />

              {/* Advertencia de usuario */}
              {(!changingUsername && invalidUsername || duplicateUsername) && (
                <div className="custom-alert-register2 bg-custom-color-register2" style={{ marginTop: '85px' }}>
                  <FaExclamationCircle className="custom-alert-icon-register2" />
                  <span>
                    {invalidUsername ? 'Formato de usuario inválido' : ''}
                    {duplicateUsername ? 'El usuario ya está en uso' : ''}
                  </span>
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
              <button type="button" className="btn flecha-btn" onClick={handlePrev}>
                <FaArrowLeft />
              </button>
            </div>

            {/* Continuar con registro */}
            <div className='flecha-register2-container-end'>
              <button type="submit" className="btn flecha-btn" disabled={fieldsEmpty || invalidName || invalidUsername || duplicateUsername}>
                <FaArrowRight />
              </button>
            </div>
      
          </div>

        </form>
      </div>

      {/* Popup de Carta Resonsiva */}
      {showResponsiveLetter && <ResponsiveLetter isChecked={isChecked} setIsChecked={setIsChecked} onClose={() => setShowResponsiveLetter(false)} />}
    </div>
  );
};