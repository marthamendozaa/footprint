import { Routes, Route, Navigate } from 'react-router-dom';
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
import { ExploreAdmin } from '../pages/ExploreAdmin/ExploreAdmin.jsx';
import { ProfileAdmin } from '../pages/ProfileAdmin/ProfileAdmin.jsx';
import { getEsAdmin } from '../pages/Login/Login.js';
import { auth } from '../backend/firebase-config.js';

export const AppRouter = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [esAdmin, setEsAdmin] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(true);

    const toggleCreate = () => {
        setIsCreateOpen(!isCreateOpen);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentUser) {
            getEsAdmin(currentUser).then(adminStatus => {
                setEsAdmin(adminStatus);
            }).catch(error => {
                console.error("Error obteniendo estado de administrador:", error.message);
            });
        }
    }, [currentUser]);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {currentUser ? (
                esAdmin ? (
                    <>
                        <Route path="/exploreAdmin" element={<PageWithNavbarAdmin component={<ExploreAdmin />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/profileAdmin" element={<PageWithNavbarAdmin component={<ProfileAdmin />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    </>
                ) : (
                    <>
                        <Route path="/home" element={<PageWithNavbar component={<Home />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/explore" element={<PageWithNavbar component={<Explore />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/requests" element={<PageWithNavbar component={<Requests />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/myInitiatives" element={<PageWithNavbar component={<MyInitiatives />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/initiative/:idIniciativa" element={<PageWithNavbar component={<Initiative />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/profile" element={<PageWithNavbar component={<Profile />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                        <Route path="/create" element={<PageWithNavbar component={<Create />} isCreateOpen={isCreateOpen} toggleCreate={toggleCreate} />} />
                    </>
                )
            ) : (
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