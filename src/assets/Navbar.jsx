import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaHome, FaCompass, FaList, FaBell, FaUser, FaPlus } from 'react-icons/fa';

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

      {/* Páginas */}
      <li className={selectedTab === 'home' ? 'selected' : ''} onClick={() => handleTabClick('home')}>
        <Link to="/home">
          <FaHome /> {showText && 'Inicio'}
        </Link>
      </li>

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
    
    <br /><br /><br /><br />
      
      {/* Botón crear */}
      <Link to="/create" onClick={() => setSelectedTab('create')}>
        <button type="button" className="btn" style={{ fontSize: "18px", width: isCreateOpen ? "130px" : "50px", backgroundColor: "#D9D9D9", borderRadius: "18px", height: "50px", fontWeight: "bold" }}>
          {isCreateOpen ? 'Crear' : <FaPlus />}
        </button>
      </Link>

    </nav>
  );
}

export default Navbar;