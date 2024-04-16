import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaHome, FaCompass, FaList, FaBell, FaUser } from 'react-icons/fa';

const Navbar = ({ isCreateOpen, toggleCreate }) => {
  const [selectedTab, setSelectedTab] = useState('');

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <nav className={`side-navbar ${isCreateOpen ? 'open' : 'closed'}`}>
      <ul>
        <div className='boton-cerrar'>
          <button onClick={toggleCreate} className="btn" style={{ backgroundColor: "transparent", border: "none", fontSize: '35px', color: '#CEDDE2'}}>
            {isCreateOpen ? '<' : '>'}
          </button>
        </div>
        <li className={selectedTab === 'home' ? 'selected' : ''} onClick={() => handleTabClick('home')}><Link to="/home"><FaHome /> {isCreateOpen ? 'Inicio' : null}</Link></li>
        <li className={selectedTab === 'explore' ? 'selected' : ''} onClick={() => handleTabClick('explore')}><Link to="/explore"><FaCompass /> {isCreateOpen ? 'Explora' : null}</Link></li>
        <li className={selectedTab === 'requests' ? 'selected' : ''} onClick={() => handleTabClick('requests')}><Link to="/requests"><FaBell /> {isCreateOpen ? 'Solicitudes' : null}</Link></li>
        <li className={selectedTab === 'myInitiatives' ? 'selected' : ''} onClick={() => handleTabClick('myInitiatives')}><Link to="/myInitiatives"><FaList /> {isCreateOpen ? 'Mis Iniciativas' : null}</Link></li>
        <li className={selectedTab === 'profile' ? 'selected' : ''} onClick={() => handleTabClick('profile')}><Link to="/profile"><FaUser /> {isCreateOpen ? 'Perfil' : null}</Link></li>
        <br /><br /><br /><br />
        <Link to="/create" onClick={() => setSelectedTab('create')}>
          <button type="button" className="btn" style={{ fontSize: "18px", width: isCreateOpen ? "130px" : "70px", backgroundColor: "#D9D9D9", borderRadius: "18px", height: "50px", fontWeight: "bold" }}>
            Crear
          </button>
        </Link>
      </ul>
    </nav>
  );
}

export default Navbar;