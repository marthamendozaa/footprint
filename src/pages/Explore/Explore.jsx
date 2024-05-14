import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { getIniciativas, addFavoritas, isFavorito, eliminarFavoritas } from './Explore-fb.js';
import Modal from 'react-bootstrap/Modal';
import { FaHeart, FaRegHeart } from "react-icons/fa";

export const Explore = ({ userId, idIniciativa }) => {
    const [filter, setFilter] = useState('');
    const [iniciativas, setIniciativas] = useState(null);
    const [filteredIniciativas, setFilteredIniciativas] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedIniciativa, setSelectedIniciativa] = useState(null); // State to store the selected iniciativa
    const [esFavorita, setEsFavorita] = useState(false);
    const [favoritos, setFavoritos] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const dataIniciativa = await getIniciativas();
            setIniciativas(dataIniciativa);
            setFilteredIniciativas(dataIniciativa); // Initialize filteredIniciativas with all iniciativas
            // Initialize favoritos state
            const favoritosInicial = {};
            dataIniciativa.forEach(iniciativa => {
                verificarFavorito(iniciativa.idIniciativa);
                favoritosInicial[iniciativa.idIniciativa] = false;
            });
            setFavoritos(favoritosInicial);
        };
        fetchData();
    }, [userId, idIniciativa]);


    const verificarFavorito = async (idIniciativa) => {
        try {
            const estaEnLista = await isFavorito(idIniciativa);
            setFavoritos(prevState => ({
                ...prevState,
                [idIniciativa]: estaEnLista
            }));
        } catch (error) {
            console.error("Error al verificar si la iniciativa está en la lista de favoritos: ", error);
        }
    };

    const searchText = (event) => {
        const searchTerm = event.target.value;
        console.log("Search Term:", searchTerm);
        setFilter(searchTerm);

        const filtered = iniciativas.filter(iniciativa =>
            iniciativa.titulo.toLowerCase().includes(searchTerm)
        );
        setFilteredIniciativas(filtered);
    }

    const handleButtonClick = (iniciativa) => {
        setSelectedIniciativa(iniciativa);
        setShowModal(true);
    }

    // Toggle de icono de favoritos
    const handleToggleFavorita = async (idIniciativa) => {
        if (favoritos[idIniciativa]) {
            await eliminarFavoritas(idIniciativa);
        } else {
            await addFavoritas(idIniciativa);
        }
        setFavoritos(prevState => ({
            ...prevState,
            [idIniciativa]: !prevState[idIniciativa]
        }));
    };

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
                <div key={index} className='e-iniciativa'>
                    <div className='meGusta' >
                        {favoritos[item.idIniciativa] ? (
                            <FaHeart onClick={() => handleToggleFavorita(item.idIniciativa)} style={{ cursor: "pointer" }} />
                        ) : (
                            <FaRegHeart onClick={() => handleToggleFavorita(item.idIniciativa)} style={{ cursor: "pointer" }} />
                        )}
                    </div>
                    <div className='e-iniciativa-imagen' onClick={() => handleButtonClick(item)}>
                        <img src={item.urlImagen} alt = {item.titulo} />
                    </div>

                    <div className='e-iniciativa-texto' onClick={() => handleButtonClick(item)}>
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
                                <div class="modalhead">
                                <div class="modalbutton">
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
                        <div className='modalsusbotton'>
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

