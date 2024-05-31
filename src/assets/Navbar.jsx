import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCompass, FaList, FaBell, FaUser, FaPlus } from 'react-icons/fa';
import logo from './evertech.png';
import logo2 from './evertech2.png';
import './Navbar.css';

const Navbar = ({ isCreateOpen, toggleCreate }) => {
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
        <button onClick={toggleCreate} className="btn" style={{ backgroundColor: "transparent", border: "none", fontSize: '35px', color: '#CEDDE2' }}>
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

      <li className={selectedTab === 'requests' ? 'selected' : ''} onClick={() => handleTabClick('requests')}>
        <Link to="/requests">
          <FaBell /> {showText && 'Solicitudes'}
        </Link>
      </li>

      <li className={selectedTab === 'myInitiatives' ? 'selected' : ''} onClick={() => handleTabClick('myInitiatives')}>
        <Link to="/myInitiatives">
          <FaList /> {showText && 'Mis Iniciativas'}
        </Link>
      </li>
      
      <li className={selectedTab === 'profile' ? 'selected' : ''} onClick={() => handleTabClick('profile')}>
        <Link to="/profile">
          <FaUser /> {showText && 'Perfil'}
        </Link>
      </li>
    
    <br /><br />
      
      {/* Botón crear */}
      <Link to="/create" onClick={() => setSelectedTab('create')}>
        <button type="button" className="btn" style={{ fontSize: "18px", width: isCreateOpen ? (showText && "130px") : "50px", backgroundColor: "#D9D9D9", borderRadius: "18px", height: "50px", fontWeight: "bold" }}>
          {isCreateOpen ? (showText && 'Crear') : <FaPlus />}
        </button>
      </Link>

    </nav>
  );
}

export default Navbar;