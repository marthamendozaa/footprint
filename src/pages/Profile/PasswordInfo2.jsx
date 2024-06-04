import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import './PasswordInfo2.css';

const PasswordInfo2 = () => {
  const [showPopover, setShowPopover] = useState(false);

  const handleMouseEnter = () => {
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    setShowPopover(false);
  };

  const passwordRules = (
    <div className="password-info-styles2">
      <h2>Recomendaciones</h2>
      <p>Usar:</p>
      <li>Números y caracteres especiales.</li>
      <li>Letras minúsculas y mayúsculas.</li>
      <li>Longitud mínima de 12 caracteres.</li>
      <p>Evitar el uso de:</p>
      <li>Repetición o patrones comunes.</li>
      <li>Información personal.</li>
    </div>
  );

  return (
    <span className="d-inline-block">
      <FaInfoCircle className='fa-info-icon2'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {showPopover && <div className="password-info-popover2">{passwordRules}</div>}
    </span>
  );
};

export default PasswordInfo2;