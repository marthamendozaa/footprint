import React, { useState } from 'react';
import './ShowText.css';

const ShowText = ({ title, children, isCreateOpen }) => {

  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    if (!isCreateOpen) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="tooltip-container-show" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div>
        {children}
      </div>
      {showTooltip && (
        <div className="tooltip-show">
          {title}
        </div>
      )}
    </div>
  );
};

export default ShowText;
