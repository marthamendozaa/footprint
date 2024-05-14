import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import { getIniciativas, suscribirseAIniciativa } from '../../api/api.js';
import { Modal, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch, FaCalendar, FaGlobe, FaUnlockAlt, FaLock } from "react-icons/fa";
import Fuse from 'fuse.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';


export const Explore = () => {
    const [filter, setFilter] = useState('');
    const [iniciativas, setIniciativas] = useState(null);
    const [filteredIniciativas, setFilteredIniciativas] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedIniciativa, setSelectedIniciativa] = useState(null); // State to store the selected iniciativa
    const [selectedIniciativaIndex, setSelectedIniciativaIndex] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const dataIniciativa = await getIniciativas();
            setIniciativas(dataIniciativa);
            setFilteredIniciativas(dataIniciativa); // Initialize filteredIniciativas with all iniciativas
        };
        fetchData();
    }, []);


    /*
    const searchText = (event) => {
        const searchTerm = event.target.value;
        console.log("Search Term:", searchTerm);
        setFilter(searchTerm);

        const filtered = iniciativas.filter(iniciativa =>
            iniciativa.titulo.toLowerCase().includes(searchTerm)
        );
        setFilteredIniciativas(filtered);
    }
    */

    
    const searchText = (event) => {
        const searchTerm = event.target.value;
        console.log("Search Term:", searchTerm);
        setFilter(searchTerm);
    
        if (!searchTerm) {
            // If the search term is empty, show all iniciativas
            setFilteredIniciativas(iniciativas);
            return;
        }
    
        const fuse = new Fuse(iniciativas, {
            keys: ['titulo','descripcion'], // Specify the keys you want to search in
            includeScore: true,
            threshold: 0.4, // Adjust the threshold as needed
        });
    
        const result = fuse.search(searchTerm);
        const filtered = result.map((item) => item.item); // Extract the actual items from Fuse.js result
        setFilteredIniciativas(filtered);
    };
    
    const { user } = useAuth();
    const [esAdmin, setEsAdmin] = useState(false);
    const [esMiembro, setEsMiembro] = useState(false);
    const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);

    const handleButtonClick = async (iniciativa, index) => {
        if (selectedIniciativa.listaMiembros.includes(user)) {
            setEsMiembro(true);
        }else if (selectedIniciativa.idAdmin === user){
            setEsAdmin(true);
        } else {
            setEsAdmin(false);
            setEsMiembro(false);
        }
        setSelectedIniciativa(iniciativa);
        setSelectedIniciativaIndex(index);
        setShowModal(true);
    }

    const handleSuscribirse = async () => {
        if (selectedIniciativa) {
            const idIniciativa = selectedIniciativa.idIniciativa; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
            try {
              const resultado = await suscribirseAIniciativa(user, idIniciativa);
              if (resultado) {
                  setShowModal(false);
                  alert("Te has suscrito a la iniciativa");
                  
                  const iniciativasNuevo = [...iniciativas];
                  iniciativasNuevo[selectedIniciativaIndex].listaMiembros.push(user);
                  setIniciativas(iniciativasNuevo);
              }
            } catch (error) {
              alert("Error al suscribirse a la iniciativa");
            } finally {
              setSuscribirDesactivado(false);
            }
        }
    }

    return (
        <div>
            {/* Spinner */}
            {filteredIniciativas ? (
                <div className='e-container'>
                    <div className='e-seccion-container'>
                        {/* Barra de búsqueda */}
                        <div className='e-searchBar'>
                            <FaSearch className="e-icons"/>
                            <input
                                type='search'
                                placeholder='¿Qué iniciativa buscas?'
                                value={filter}
                                onChange={searchText}
                                className='e-searchBarCaja'
                            />
                        </div>

                        {/* Iniciativas */}
                        <div className='e-iniciativas-container'>
                        {filteredIniciativas && filteredIniciativas.map((item, index) => (
                            <div key={index} className='e-iniciativa' onClick={() => handleButtonClick(item, index)}>
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

                        {/* Mostrar información adicional */}
                        <ModalIniciativa
                        showModal={showModal}
                        setShowModal={setShowModal}
                        selectedIniciativa={selectedIniciativa}
                        handleSuscribirse={handleSuscribirse}
                        esAdmin={esAdmin}
                        esMiembro={esMiembro}
                        suscribirDesactivado={suscribirDesactivado}
                        /> 
                    </div>
                </div>
            ) : (
                <div className="spinner">
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            )}
        </div>
    );
};