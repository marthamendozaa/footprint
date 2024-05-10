import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import { getIniciativas, suscribirseAIniciativa } from '../../api/api.js';
import { Spinner, Modal } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch, FaCalendar, FaGlobe, FaUnlockAlt, FaLock } from "react-icons/fa";
import Fuse from 'fuse.js';


export const Explore = () => {
    const [filter, setFilter] = useState('');
    const [iniciativas, setIniciativas] = useState(null);
    const [filteredIniciativas, setFilteredIniciativas] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedIniciativa, setSelectedIniciativa] = useState(null); // State to store the selected iniciativa

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
    

    const handleButtonClick = (iniciativa) => {
        setSelectedIniciativa(iniciativa);
        setShowModal(true);
    }

    const { user } = useAuth();
    const handleSuscribirse = async () => {
        if (selectedIniciativa) {
            const idIniciativa = selectedIniciativa.id; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
            const resultado = await suscribirseAIniciativa(user, idIniciativa);
            if (resultado) {
                setShowModal(false);
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

                        {/* Mostrar información adicional */}
                        <Modal show={showModal} onHide={() => setShowModal(false)} centered className='e-modal'>
                            <div className="modalcontainer">
                                <Modal.Header style={{ border: "none" }} closeButton> </Modal.Header>
                                
                                <div className='modaliniciativa'>
                                    {selectedIniciativa && (
                                        <>
                                            <div className="modalhead">
                                                <img src={selectedIniciativa.urlImagen} alt={selectedIniciativa.titulo} className="modalimg" />
                                            </div>
                                            
                                            <div className='modalinfo'>
                                                <div className='modaltitulo'>{selectedIniciativa.titulo}</div>
                                                
                                                {/* Etiquetas */}
                                                <div className="m-etiquetas">
                                                    {Object.values(selectedIniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                                                        <li key={idEtiqueta} className={'m-etiqueta-item'}>
                                                        {etiqueta}
                                                        </li>
                                                    ))}
                                                </div>

                                                <div className='modalfecha'> <FaCalendar style={{marginRight: '5px'}} />{selectedIniciativa.fechaInicio} - {selectedIniciativa.fechaCierre ? selectedIniciativa.fechaCierre : 'S.F.'} </div>
                                                <div className='modalregion'> <FaGlobe style={{marginRight: '5px'}} />{selectedIniciativa.region} </div>
                                                <div className='modalpublica'>
                                                    {selectedIniciativa.esPublica ? <><FaUnlockAlt style={{marginRight: '5px'}} />Pública</> : <><FaLock style={{marginRight: '5px'}} />Privada</>}
                                                </div>

                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className = 'modaldesc'>
                                    {selectedIniciativa && (
                                        <>
                                            <div className='modaltextodesc'>{selectedIniciativa.descripcion}</div>
                                        </>
                                    )}
                                </div>

                                <div className = 'modalsuscribir'>
                                    <div className='modalsusbotton' onClick={handleSuscribirse}>
                                        Suscribirse
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    
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