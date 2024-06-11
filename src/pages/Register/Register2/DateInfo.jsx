import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import './DateInfo.css';

const DateInfo = () => {
  const [showPopover, setShowPopover] = useState(false);

  const handleMouseEnter = () => {
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    setShowPopover(false);
  };

  const dateRules = (
    <div className="date-info-styles">
      <h2>Requisitos de edad</h2>
      <p>Como usuario debes tener un mínimo de 15 años de edad. 
         En caso de ser menor de edad deberás firmar una carta
         responsiva.</p>
    </div>
  );

  return (
    <span className="d-d-inline-block">
      <FaInfoCircle className='d-fa-info-icon'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {showPopover && (
        <div className="date-info-popover"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
        {dateRules}
        </div>)}
    </span>
  );
};

export default DateInfo;