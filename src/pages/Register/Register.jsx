import React, { useState } from 'react';
import { Register1 } from './Register1/Register1';
import { Register2 } from './Register2/Register2';
import { Register3 } from './Register3/Register3';
import { Register4 } from './Register4/Register4';
import './Register.css';

export const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="register-container">
      {currentStep === 1 && <Register1 onNext={handleNext} />}
      {currentStep === 2 && <Register2 onPrev={handlePrev} onNext={handleNext} />}
      {currentStep === 3 && <Register3 onPrev={handlePrev} onNext={handleNext} />}
      {currentStep === 4 && <Register4 onPrev={handlePrev} />}
    </div>
  );
};