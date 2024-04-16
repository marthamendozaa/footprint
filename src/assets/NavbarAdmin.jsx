import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaCompass, FaUser } from 'react-icons/fa';

const NavbarAdmin = ({ isCreateOpen, toggleCreate }) => {
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
        <li className={selectedTab === 'explore' ? 'selected' : ''} onClick={() => handleTabClick('explore')}><Link to="/exploreAdmin"><FaCompass /> {isCreateOpen ? 'Explora' : null}</Link></li>
        <li className={selectedTab === 'profile' ? 'selected' : ''} onClick={() => handleTabClick('profile')}><Link to="/profileAdmin"><FaUser /> {isCreateOpen ? 'Perfil' : null}</Link></li>
      </ul>
    </nav>
  );
}

export default NavbarAdmin;