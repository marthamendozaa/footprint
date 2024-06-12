import React, { useState } from 'react';
import './ShowTarea.css';

const ShowTarea = ({ title, children, isCreateOpen }) => {

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
    <div className="tooltip-container-tarea" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div>
        {children}
      </div>
      {showTooltip && (
        <div className="tooltip-tarea">
          {title}
        </div>
      )}
    </div>
  );
};

export default ShowTarea;