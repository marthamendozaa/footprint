import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ExploreAdmin.css';
import { getIniciativas, eliminaIniciativa } from '../../api/api.js';
import { Modal, Button } from 'react-bootstrap';
import { FaSearch } from "react-icons/fa";
import Fuse from 'fuse.js';

export const ExploreAdmin = () => {
  // Iniciativa seleccionada a eliminar
  const [iniciativaEliminar, setIniciativaEliminar] = useState(null);
  const [idIniciativaEliminar, setIdIniciativaEliminar] = useState(null);

  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const handleCerrarEliminar = () => setModalEliminar(false);
  const handleMostrarEliminar = (iniciativa, idIniciativa) => {
    setIniciativaEliminar(iniciativa);
    setIdIniciativaEliminar(idIniciativa);
    setModalEliminar(true);
  }

  // Modal de iniciativa eliminada
  const [modalEliminada, setModalEliminada] = useState(false);
  const handleMostrarEliminada = () => setModalEliminada(true);
  const handleCerrarEliminada = async () => {
    setModalEliminada(false);
    const dataIniciativas = await getIniciativas();
    setIniciativas(dataIniciativas);
    setFilteredIniciativas(dataIniciativas);
  }

  // Modal de error
  const [modalError, setModalError] = useState(false);
  const handleMostrarError = () => setModalError(true);
  const handleCerrarError = () => setModalError(false);

  // Eliminar iniciativa
  const handleEliminaIniciativa = async () => {
    console.log("Eliminando iniciativa con id: ", idIniciativaEliminar);
    handleCerrarEliminar();
    try {
      await eliminaIniciativa(idIniciativaEliminar);
      handleMostrarEliminada();
    } catch(error) {
      handleMostrarError();
    }
  };

  const [filter, setFilter] = useState('');
  const [iniciativas, setIniciativas] = useState(null);
  const [filteredIniciativas, setFilteredIniciativas] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dataIniciativas = await getIniciativas();
      setIniciativas(dataIniciativas);
      setFilteredIniciativas(dataIniciativas);
    };
    fetchData();
  }, []);

  /*
  const searchText = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setFilter(searchTerm);

    const filtered = iniciativas.filter(iniciativa =>
      iniciativa.nombre.toLowerCase().includes(searchTerm)
    );
    setFilteredIniciativas(filtered);
  };

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

  return (
    <div className='ea-container'>
      <div className='ea-seccion-container'>
          <div className='ea-searchBar'>
            <FaSearch className="ea-icons"/>
            <input
              type='search'
              placeholder='¿Qué iniciativa buscas?'
              value={filter}
              onChange={searchText}
              className='ea-searchBarCaja'
            />
            
          </div>
      </div>

      <div className='ea-iniciativas-container'>
      {filteredIniciativas && filteredIniciativas.map((item, index) => (
        <div key={index} className='ea-iniciativa'>

          <div className='ea-iniciativa-imagen'>
            <img src={item.urlImagen} alt={item.titulo} />
          </div>

          <div className='ea-iniciativa-texto'>
            <div className="ea-titulo">{item.titulo}</div>
            <div className="ea-desc">{item.descripcion}</div>
            <div className='ea-boton'>
            <Button className="btn-eliminar-tarjeta-1" onClick={() => handleMostrarEliminar(item.titulo, item.idIniciativa)}>Eliminar</Button>
            </div>
          </div>

        </div>
      ))}
      </div>

      {/* Modal confirmar eliminar iniciativa*/}
      <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          <div className="ea-modal-body">
            ¿Estás seguro que quieres eliminar la iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span>?
          </div>
        <Modal.Footer>
          <Button className="eliminar" onClick={handleEliminaIniciativa}>Eliminar</Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal iniciativa eliminada*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span> eliminada exitosamente
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal error eliminar*/}
      <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
        <Modal.Header closeButton>
        <div className="ea-modal-title">Error</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Error al eliminar iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span>
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarError}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
    
  );
};