import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCompass, FaList, FaBell, FaUser, FaPlus } from 'react-icons/fa';
import logo from './evertech.png';
import logo2 from './evertech2.png';
import './Navbar.css';

const CustomLink = ({ to, title, children, isCreateOpen }) => {
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
    <div className="tooltip-container-nav">
      <Link to={to} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </Link>
      {showTooltip && (
        <div className="tooltip-nav">
          {title}
        </div>
      )}
    </div>
  );
};

const Navbar = ({ isCreateOpen, toggleCreate }) => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('');
  const [showText, setShowText] = useState(false);

  const { notificaciones } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/explore') setSelectedTab('explore');
    else if (path === '/requests') setSelectedTab('requests');
    else if (path === '/myInitiatives') setSelectedTab('myInitiatives');
    else if (path === '/profile') setSelectedTab('profile');
    else if (path === '/create') setSelectedTab('create');

    if (isCreateOpen) {
      const delayDuration = 250;
      const timeoutId = setTimeout(() => {
        setShowText(true);
      }, delayDuration);

      return () => clearTimeout(timeoutId);
    } else {
      setShowText(false);
    }
  }, [isCreateOpen, location.pathname]);

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <nav className={`side-navbar ${isCreateOpen ? 'open' : 'closed'}`}>
      <div className='boton-cerrar'>
        <button onClick={toggleCreate} className="btn" style={{ backgroundColor: "transparent", border: "none", fontSize: '35px', color: '#CEDDE2' }}>
          {isCreateOpen ? '<' : '>'}
        </button>
      </div>
      <div style={{ display: "flex", minHeight: "100px", marginBottom: "70px" }}>
        <Link to="/explore" onClick={() => handleTabClick('explore')}>
          {isCreateOpen ? (     
            <img src={logo} style={{ width: "80%", paddingTop: "20px", objectFit: "contain", paddingRight: '10px' }} alt="Logo"/>
          ) : (
            <img src={logo2} style={{ width: "100%", objectFit: "contain" }} alt="Logo"/>
          )}
        </Link>
      </div>
      <li className={selectedTab === 'explore' ? 'selected' : ''} onClick={() => handleTabClick('explore')}>
        <CustomLink to="/explore" title="Explora" isCreateOpen={isCreateOpen}>
          <FaCompass /> {showText && 'Explora'}
        </CustomLink>
      </li>
      <li className={selectedTab === 'requests' ? 'selected' : ''} onClick={() => handleTabClick('requests')}>
        <CustomLink to="/requests" title="Solicitudes" isCreateOpen={isCreateOpen}>
          <FaBell /> {notificaciones > 0 && <div className={selectedTab === 'requests' ? 'rq-notifs-selected' : 'rq-notifs'}>{notificaciones}</div>} {showText && 'Solicitudes'}
        </CustomLink>
      </li>
      <li className={selectedTab === 'myInitiatives' ? 'selected' : ''} onClick={() => handleTabClick('myInitiatives')}>
        <CustomLink to="/myInitiatives" title="Mis iniciativas" isCreateOpen={isCreateOpen}>
          <FaList /> {showText && 'Mis Iniciativas'}
        </CustomLink>
      </li>
      <li className={selectedTab === 'profile' ? 'selected' : ''} onClick={() => handleTabClick('profile')}>
        <CustomLink to="/profile" title="Perfil" isCreateOpen={isCreateOpen}>
          <FaUser /> {showText && 'Perfil'}
        </CustomLink>
      </li>
      <br /><br />
      <Link to="/create" onClick={() => setSelectedTab('create')}>
        <button type="button" className="btn" style={{ fontSize: "18px", width: isCreateOpen ? (showText && "130px") : "50px", backgroundColor: "#D9D9D9", borderRadius: "18px", height: "50px", fontWeight: "bold" }}>
          {isCreateOpen ? (showText && 'Crear') : <FaPlus />}
        </button>
      </Link>
    </nav>
  );
}

export default Navbar;
