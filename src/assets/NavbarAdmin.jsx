import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './evertech.png';
import logo2 from './evertech2.png';
import { FaCompass, FaUser } from 'react-icons/fa';

const NavbarAdmin = ({ isCreateOpen, toggleCreate }) => {
  const [selectedTab, setSelectedTab] = useState('');
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Navbar abierto muestra el texto
    if (isCreateOpen) {
      const delayDuration = 250;
      const timeoutId = setTimeout(() => {
        setShowText(true);
      }, delayDuration);
      
      return () => clearTimeout(timeoutId);
      
    } else {
      // Navbar cerrado oculta el texto
      setShowText(false);
    }
  }, [isCreateOpen]);

  // Función para cambiar la pestaña seleccionada
  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };
  
  return (
    <nav className={`side-navbar ${isCreateOpen ? 'open' : 'closed'}`}>

      {/* Botón para cambiar el tamaño del navbar */}
      <div className='boton-cerrar'>
          <button onClick={toggleCreate} className="btn" style={{ backgroundColor: "transparent", border: "none", fontSize: '35px', color: '#CEDDE2'}}>
            {isCreateOpen ? '<' : '>'}
          </button>
      </div>

      {/* Logo */}
      {isCreateOpen ? (
        <img src={logo} style={{marginBottom: '70px'}}/>
      ) : (
        <img src={logo2} style={{marginBottom: '70px'}}/>
      )}

      {/* Páginas */}
      <li className={selectedTab === 'explore' ? 'selected' : ''} onClick={() => handleTabClick('explore')}>
        <Link to="/explore">
          <FaCompass /> {showText && 'Explora'}
        </Link>
      </li>

      <li className={selectedTab === 'profile' ? 'selected' : ''} onClick={() => handleTabClick('profile')}>
        <Link to="/profile">
          <FaUser /> {showText && 'Perfil'}
        </Link>
      </li>
      
    </nav>
  );
}

export default NavbarAdmin;