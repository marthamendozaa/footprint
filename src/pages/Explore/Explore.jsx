import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { AiOutlineSearch } from "react-icons/ai";
import { getIniciativas, suscribirseAIniciativa, verificarRolUsuario } from './Explore-fb.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Explore = () => {
    const [filter, setFilter] = useState('');
    const [iniciativas, setIniciativas] = useState(null);
    const [filteredIniciativas, setFilteredIniciativas] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedIniciativa, setSelectedIniciativa] = useState(null); // State to store the selected iniciativa
    const [esAdmin, setEsAdmin] = useState(false);
    const [esMiembro, setEsMiembro] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const dataIniciativa = await getIniciativas();
            setIniciativas(dataIniciativa);
            setFilteredIniciativas(dataIniciativa); // Initialize filteredIniciativas with all iniciativas
        };
        fetchData();
    }, []);

    const searchText = (event) => {
        const searchTerm = event.target.value;
        console.log("Search Term:", searchTerm);
        setFilter(searchTerm);

        const filtered = iniciativas.filter(iniciativa =>
            iniciativa.titulo.toLowerCase().includes(searchTerm)
        );
        setFilteredIniciativas(filtered);
    }

    const handleButtonClick = async (iniciativa) => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) return;

        const rol = await verificarRolUsuario(user.uid, iniciativa.id);
        if (rol === "admin" || rol === "miembro") {
            if (rol === "admin") setEsAdmin(true);
            if (rol === "miembro") setEsMiembro(true);
        } else {
            setEsAdmin(false);
            setEsMiembro(false);
        }
        setSelectedIniciativa(iniciativa);
        setShowModal(true);
    }

    const handleSuscribirse = async () => {
        if (selectedIniciativa) {
            const idIniciativa = selectedIniciativa.id;
            const resultado = await suscribirseAIniciativa(idIniciativa);
            if (resultado) {
                console.log("Suscripción exitosa a la iniciativa con ID:", resultado);
                setShowModal(false);
            } else {
                console.error("Error al suscribirse a la iniciativa");
            }
        }
    }

    return (
        <div>
            <div className='e-container'>
            <div className='e-seccion-container'>
                    <div className='e-searchBar'>
                        <input
                            type='search'
                            placeholder='¿Qué iniciativa buscas?'
                            value={filter}
                            onChange={searchText}
                            className='p-4 rounded-full color'
                            style={{ width: '100%' }}
                        />
                    </div>

            <div className='e-iniciativas-container'>
            {filteredIniciativas && filteredIniciativas.map((item, index) => (
                <div key={index} className='e-iniciativa' onClick={() => handleButtonClick(item)}>
                    <div className='e-iniciativa-imagen'>
                    <img src={item.urlImagen} alt = {item.titulo} />
                    </div>
                    <div className='e-iniciativa-texto'>
                        <div className="e-titulo">{item.titulo}</div>
                        <div className="e-desc">{item.descripcion}</div>
                    
                    </div>
                </div>
            ))}
            </div>

            {/* Modal */}
            <ModalIniciativa
                        showModal={showModal}
                        setShowModal={setShowModal}
                        selectedIniciativa={selectedIniciativa}
                        handleSuscribirse={handleSuscribirse}
                        esAdmin={esAdmin}
                        esMiembro={esMiembro}
                    />
            </div>
            </div>
        </div>
    );
};

