import React, { useState } from 'react';
import { Register1 } from './Register1/Register1';
import { Register2 } from './Register2/Register2';
import { Register3 } from './Register3/Register3';
import { Register4 } from './Register4/Register4';
import Usuario from '../../classes/Usuario.js';
import './Register.css';

export const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [usuario, setUsuario] = useState(new Usuario());

  const handleNext = (usuarioData) => {
    setUsuario(usuarioData);
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = (usuarioData) => {
    setUsuario(usuarioData);
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="register-container">
      {currentStep === 1 && <Register1 onNext={handleNext} usuario={usuario} />}
      {currentStep === 2 && <Register2 onPrev={handlePrev} onNext={handleNext} usuario={usuario} />}
      {currentStep === 3 && <Register3 onPrev={handlePrev} onNext={handleNext} usuario={usuario} />}
      {currentStep === 4 && <Register4 onPrev={handlePrev} usuario={usuario} />}
    </div>
  );
};