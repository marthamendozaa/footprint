import React, { useState } from 'react';
import { ForgotPassword1 } from './ForgotPassword1/ForgotPassword1';
import { ForgotPassword2 } from './ForgotPassword2/ForgotPassword2';
import Usuario from '../../classes/Usuario.js';
import './ForgotPassword.css';

export const ForgotPassword = () => {
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
    <div className="password-container">
      {currentStep === 1 && <ForgotPassword1 onNext={handleNext} usuario={usuario} />}
      {currentStep === 2 && <ForgotPassword2 onPrev={handlePrev} onNext={handleNext} usuario={usuario} />}
    </div>
  );
};