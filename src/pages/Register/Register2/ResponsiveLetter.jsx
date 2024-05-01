import React, { useState, useEffect } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import './ResponsiveLetter.css';

export const ResponsiveLetter = ({ isChecked, setIsChecked, onClose }) => {
  const [tutorName, setTutorName] = useState('');
  const [minorName, setMinorName] = useState('');
  const [tutorNameError, setTutorNameError] = useState('');
  const [minorNameError, setMinorNameError] = useState('');
  const [checkboxError, setCheckboxError] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const today = new Date();

  const handleCheckboxChange = () => {
    if (!tutorName.trim() || !minorName.trim() || tutorNameError || minorNameError) {
      setCheckboxError(true);
    } else {
      setFieldsDisabled(true);
      setIsChecked(!isChecked);
      setCheckboxError(false);
    }

    if (isChecked) {
      setFieldsDisabled(false);
    }

  };

  const handleTutorNameChange = (event) => {
    const value = event.target.value;
    setTutorName(value);
    if (!onlyLetters(value)) {
      setTutorNameError(<><FaExclamationCircle className="rl-icon-error" /> El nombre del tutor solo puede contener letras</>);
      document.getElementById('tutorName').classList.add('error-input');
    } else {
      setTutorNameError('');
      document.getElementById('tutorName').classList.remove('error-input');
    }
    if (!value.trim()) {
      setTutorNameError(<><FaExclamationCircle className="rl-icon-error" /> El nombre del tutor no puede estar vacío</>);
      document.getElementById('tutorName').classList.add('error-input');
    }
  };  

  const handleMinorNameChange = (event) => {
    const value = event.target.value;
    setMinorName(value);
    if (!onlyLetters(value)) {
      setMinorNameError(<><FaExclamationCircle className="rl-icon-error" />El nombre del menor solo puede contener letras</>);
      document.getElementById('minorName').classList.add('error-input');
    } else {
      setMinorNameError('');
      document.getElementById('minorName').classList.remove('error-input');
    }
    if (!value.trim()) {
      setMinorNameError(<><FaExclamationCircle className="rl-icon-error" /> El nombre del menor no puede estar vacío</>);
      document.getElementById('minorName').classList.add('error-input');
    }
  };

  const onlyLetters = (text) => {
    return /^[a-zA-Z]+$/.test(text);
  };

  useEffect(() => {
    setCheckboxError(false);
  }, [tutorName, minorName]);

  return (
    <div className='rl-pop-up'>
      <div className='rl-pop-up-2'>
        {/* Titulo */}
        <h2 style={{ textAlign: 'center' }}>Carta Responsiva - Menor de Edad</h2>
        
        {/* Contenido */}
        <p> 
          {/* Fecha */}
          Fecha: [{today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}]
          <br /><br />
          
          {/* Tutor */}
          <div className="rl-input-with-error">
            <label htmlFor="tutorName">Nombre del tutor legal:</label>
            <input
                type="text"
                id="tutorName"
                value={tutorName}
                onChange={handleTutorNameChange}
                disabled={fieldsDisabled}
            />
            {tutorNameError && (
                <p className="rl-error-message-1">{tutorNameError}</p>
            )}
          </div>
          <br />
          
          {/* Menor */}
          <div className="rl-input-with-error">
            <label htmlFor="minorName">Nombre completo del menor de edad:</label>
            <input
                type="text"
                id="minorName"
                value={minorName}
                onChange={handleMinorNameChange}
                disabled={fieldsDisabled}
            />
            {minorNameError && (
                <p className="rl-error-message-2">{minorNameError}</p>
            )}
          </div>
          <br />
          
          {/* Contenido */}
          Por medio de la presente, yo, {tutorName}, en calidad de tutor legal de {minorName}, en adelante "El Menor", autorizo su participación en la red social de trabajo Carbon Offset Marcketplace, en adelante "La Red".
          <br /><br />
          Entiendo y acepto que como tutor legal, soy responsable de supervisar las actividades y el uso de la información del menor en La Red. Autorizo específicamente lo siguiente:
        </p>

        {/* Lista de autorizaciones */}
        <ul>
          <li>El uso de la información personal del menor para crear y mantener su cuenta en La Red.</li>
          <li>La participación del menor en iniciativas y actividades dentro de La Red.</li>
          <li>La comunicación con el menor sobre su cuenta, iniciativas en las que participe y actualizaciones importantes relacionadas con La Red.</li>
        </ul>

        {/* Contenido x2 */}
        <p>
          Declaro que he leído y entiendo los términos y condiciones de uso de La Red, así como su política de privacidad.
          <br /><br />
          Por medio de mi firma y el marcado de la casilla a continuación, manifiesto mi consentimiento y aceptación de los términos mencionados.
        </p>

        {/* Casilla de aceptación */}
        <div className="agree-checkbox">
          <input type="checkbox" id="agreeCheckbox" checked={isChecked} onChange={handleCheckboxChange} />
          <label htmlFor="agreeCheckbox">Acepto los términos y condiciones mencionados anteriormente en nombre del menor de edad</label>
          {checkboxError && <p className="rl-error-message-3"><FaExclamationCircle className="rl-icon-error" /> Por favor, solucione las alertas</p>}
        </div>

        {/* Botón de cierre */}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};