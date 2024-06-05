import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../assets/Navbar';
import NavbarAdmin from '../assets/NavbarAdmin';
import { Explore } from '../pages/Explore/Explore.jsx';
import { Requests } from '../pages/Requests/Requests.jsx';
import { MyInitiatives } from '../pages/MyInitiatives/MyInitiatives.jsx';
import { Initiative } from '../pages/Initiative/Initiative.jsx'; 
import { Profile } from '../pages/Profile/Profile.jsx';
import { Create } from '../pages/Create/Create.jsx';
import { Login } from '../pages/Login/Login.jsx';
import { Register } from '../pages/Register/Register.jsx';
import { ForgotPassword } from '../pages/ForgotPassword/ForgotPassword.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const AppRouter = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const toggleCreate = () => {
        setIsCreateOpen(!isCreateOpen);
    };

    {/* Obtiene usuario y estado de administrador */}
    const { user, admin } = useAuth();
    
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
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {user && admin && (
                <>
                    <Route path="/explore" element={<PageWithNavbarAdmin component={<Explore />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/profile" element={<PageWithNavbarAdmin component={<Profile />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                </>
            )}
            {user && !admin &&(
                <>
                    <Route path="/explore" element={<PageWithNavbar component={<Explore />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/requests" element={<PageWithNavbar component={<Requests />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/myInitiatives" element={<PageWithNavbar component={<MyInitiatives />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/initiative/:idIniciativa" element={<PageWithNavbar component={<Initiative />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/profile" element={<PageWithNavbar component={<Profile />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    <Route path="/create" element={<PageWithNavbar component={<Create />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                </>
            )}

            {user ? (
                <Route path="*" element={savedLocation ? (<Navigate to={savedLocation} />) : (<Navigate to="/explore" />)}/>
              ) : (
                <Route path="*" element={<Navigate to="/login" />}/>
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
            {/* El style es lo que hace que el contenido se mueva */}
            <div className="content-container" style={{ marginLeft: isCreateOpen ? '190px' : '100px', transition: 'margin-left 0.3s ease' }}>
                {component}
            </div>
        </div>
    );
};