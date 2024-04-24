import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../assets/Navbar';
import NavbarAdmin from '../assets/NavbarAdmin';
import { Home } from '../pages/Home/Home.jsx';
import { Explore } from '../pages/Explore/Explore.jsx';
import { Requests } from '../pages/Requests/Requests.jsx';
import { MyInitiatives } from '../pages/MyInitiatives/MyInitiatives.jsx';
import { Initiative } from '../pages/Initiative/Initiative.jsx'; 
import { Profile } from '../pages/Profile/Profile.jsx';
import { Create } from '../pages/Create/Create.jsx';
import { Login } from '../pages/Login/Login.jsx';
import { Register } from '../pages/Register/Register1/Register.jsx';
import { Register2} from '../pages/Register/Register2/Register2.jsx';
import { ExploreAdmin } from '../pages/ExploreAdmin/ExploreAdmin.jsx';
import { ProfileAdmin } from '../pages/ProfileAdmin/ProfileAdmin.jsx';
import { getEsAdmin } from '../pages/Login/Login-fb.js';
import { auth } from '../backend/firebase-config.js';

export const AppRouter = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(true);

    const toggleCreate = () => {
        setIsCreateOpen(!isCreateOpen);
    };

    {/* Obtiene usuario y estado de administrador */}
    const [currentUser, setCurrentUser] = useState(() => {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    });
    const [esAdmin, setEsAdmin] = useState(() => {
        const admin = sessionStorage.getItem('esAdmin');
        return admin ? JSON.parse(admin) : false;
    });
  
    useEffect(() => {
        {/* Firebase detecta cambios en autentificación del usuario */}
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
              {/* Almacena información del usuario al hacer login */}
              sessionStorage.setItem('user', JSON.stringify(user));
              setCurrentUser(user);
              getEsAdmin(user)
                  .then(admin => {
                      sessionStorage.setItem('esAdmin', JSON.stringify(admin));
                      setEsAdmin(admin);
                  })
                  .catch(error => {
                      console.error("Error obteniendo estado de administrador:", error.message);
                  });
            } else {
                {/* Elimina información del usuario al cerrar sesión */}
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('esAdmin');
                setCurrentUser(null);
                setEsAdmin(false);
            }
      });
  
        return unsubscribe;
    }, []);
    
    {/* Obtiene información de su última ventana abierta */}
    const location = useLocation();
    const saveLocation = () => {
        localStorage.setItem('savedLocation', location.pathname);
    };
  
    useEffect(() => {
        saveLocation();
    }, [location]);
  
    const savedLocation = localStorage.getItem('savedLocation') || null;

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register2" element={<Register2 />} />

            {currentUser && esAdmin && (
                <>
                    <Route path="/exploreAdmin" element={<PageWithNavbarAdmin component={<ExploreAdmin />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/profileAdmin" element={<PageWithNavbarAdmin component={<ProfileAdmin />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                </>
            )}
            {currentUser && (
                <>
                    <Route path="/home" element={<PageWithNavbar component={<Home />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/explore" element={<PageWithNavbar component={<Explore />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/requests" element={<PageWithNavbar component={<Requests />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/myInitiatives" element={<PageWithNavbar component={<MyInitiatives />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/initiative/:idIniciativa" element={<PageWithNavbar component={<Initiative />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/profile" element={<PageWithNavbar component={<Profile />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/create" element={<PageWithNavbar component={<Create />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                </>
            )}

            {currentUser ? (
                <Route path="*" element={savedLocation ? (
                    <Navigate to={savedLocation} />) : (
                        esAdmin ? (<Navigate to="/exploreAdmin" />) : (
                            <Navigate to="/home" />
                        )
                    )}
                />) : (
                    <Route path="*" element={<Navigate to="/login" />} />
            )}
        </Routes>
    );
};

const PageWithNavbar = ({ component, isCreateOpen, toggleCreate }) => {
    return (
        <div>
            <Navbar isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />
            <div className="content-container" style={{ marginLeft: isCreateOpen ? '190px' : '100px', transition: 'margin-left 0.3s ease' }}>
                {component}
            </div>
        </div>
    );
};

const PageWithNavbarAdmin = ({ component, isCreateOpen, toggleCreate }) => {
    return (
        <div>
            <NavbarAdmin isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />
            <div className="content-container" style={{ marginLeft: isCreateOpen ? '190px' : '100px', transition: 'margin-left 0.3s ease' }}>
                {component}
            </div>
        </div>
    );
};