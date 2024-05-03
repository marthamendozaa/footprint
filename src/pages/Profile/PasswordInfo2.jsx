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
      <h2>Requisitos de contraseña</h2>
      <p>Debe contener al menos:</p>
      <li> 8 caracteres</li>
      <li> Un caracter especial</li>
      <li> Un número</li>
      <li> Una letra mayúscula </li>
    </div>
  );

  return (
    <span
      className="d-inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FaInfoCircle className='fa-info-icon2'/>
      {showPopover && <div className="password-info-popover2">{passwordRules}</div>}
    </span>
  );
};

export default PasswordInfo2;