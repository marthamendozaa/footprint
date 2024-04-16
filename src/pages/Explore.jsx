import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { AiOutlineSearch } from "react-icons/ai";
import { getIniciativas } from '../backend/Explore-functions.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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

    const searchText = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setFilter(searchTerm);

        const filtered = iniciativas.filter(iniciativa =>
            iniciativa.nombre.toLowerCase().includes(searchTerm)
        );
        setFilteredIniciativas(filtered);
    }

    const handleButtonClick = (iniciativa) => {
        setSelectedIniciativa(iniciativa);
        setShowModal(true);
    }

    return (
        <div className='row'>
            <div className='col-12 mb-5'>
                <form>
                    <div className='relative'>
                        <input
                            type='search'
                            placeholder='¿Qué iniciativa buscas?'
                            value={filter}
                            onChange={searchText}
                            className='p-4 rounded-full color'
                            style={{ width: '1000px' }}
                        />
                        <button className='absolute right-1 top-0 -translate-y-0 p-4 bg-slate-300 rounded-full' style={{ backgroundColor: 'transparent', display: filter ? 'none' : 'block' }}>
                            <AiOutlineSearch />
                        </button>
                    </div>
                </form>
            </div>

            {filteredIniciativas && filteredIniciativas.map((item, index) => (
                <div key={index} className='col-md-6 col-lg-3 mx-0 mb-4'>
                    <div className='card p- overflow.hidden h-100 shadow'>
                        <img src={item.urlImagen} className='card-img-top imagesize' alt={item.titulo} />
                        <div className='card-body'>
                            <h5 className='card-title titles'>{item.titulo}</h5>
                            <p className='card-text'>{item.descripcion}</p>
                            <Button onClick={() => handleButtonClick(item)} variant="primary">Más Información</Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedIniciativa && selectedIniciativa.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedIniciativa && <p>{selectedIniciativa.descripcion}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

