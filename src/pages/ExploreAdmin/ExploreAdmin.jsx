import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ExploreAdmin.css';
import { AiOutlineSearch } from "react-icons/ai";
import { getIniciativas, eliminaIniciativa } from './ExploreAdmin-fb.js';
import { Modal, Button } from 'react-bootstrap';

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
    try {
      await eliminaIniciativa(idIniciativaEliminar);
      handleCerrarEliminar();
      handleMostrarEliminada();
    } catch {
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

  const searchText = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setFilter(searchTerm);

    const filtered = iniciativas.filter(iniciativa =>
      iniciativa.nombre.toLowerCase().includes(searchTerm)
    );
    setFilteredIniciativas(filtered);
  };

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
              <Button onClick={() => handleMostrarEliminar(item.titulo, item.idIniciativa)}>Eliminar</Button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal confirmar eliminar iniciativa*/}
      <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            ¿Estás seguro que quieres eliminar la iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span>?
          </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleEliminaIniciativa}>Eliminar</Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal iniciativa eliminada*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header></Modal.Header>
          <Modal.Body>
            Iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span> eliminada exitosamente
          </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal error eliminar*/}
      <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
        <Modal.Header></Modal.Header>
          <Modal.Body>
            Error al eliminar iniciativa <span style={{fontWeight:'bold'}}>{iniciativaEliminar}</span>
          </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCerrarError}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};