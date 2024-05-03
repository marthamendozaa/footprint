import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { AiOutlineSearch } from "react-icons/ai";
import { getIniciativas, suscribirseAIniciativa } from './Explore-fb.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ModalHeader } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";
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

    const handleSuscribirse = async () => {
        if (selectedIniciativa) {
            const idIniciativa = selectedIniciativa.id; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
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
                        <FaSearch className="e-icons"/>
                        <input
                            type='search'
                            placeholder='¿Qué iniciativa buscas?'
                            value={filter}
                            onChange={searchText}
                            className='e-searchBarCaja'
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
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className='modal1'>
                <div className=".modalcontainer">
                    
                    <div className='modaliniciativa'>
                        {selectedIniciativa && (
                            <>
                                <div className="modalhead">
                                <div className="modalbutton">
                                <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                </div>
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
                                    
                                    <div className='modalregion'>{selectedIniciativa.region} </div>
                                    <div className='modalpublica'>{selectedIniciativa.esPublica ? "Pública" : "Privada"} </div>
                                    <div className='modalfecha'>{selectedIniciativa.fechaInicio} - {selectedIniciativa.fechaCierre ? selectedIniciativa.fechaCierre : 'S.F.'} </div>
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
        </div>
    );
};

