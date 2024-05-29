import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import Solicitud from '../../classes/Solicitud.js'
import { getIniciativas, crearSolicitud, getUsuario, actualizaUsuario, getMisIniciativas, suscribirseAIniciativa, existeSolicitud, eliminaIniciativa, sendMail } from '../../api/api.js';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";
import Fuse from 'fuse.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Explore = () => {
  // Iniciativas
  const [filter, setFilter] = useState('');
  const [iniciativas, setIniciativas] = useState(null);
  const [filteredIniciativas, setFilteredIniciativas] = useState(null);
  const [admins, setAdmins] = useState(null);

  // Seleccionar una iniciativa
  const [showModal, setShowModal] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState(null);
  const [selectedIniciativaIndex, setSelectedIniciativaIndex] = useState(null);

  // Usuario actual
  const { user, esAdmin } = useAuth();
  const [usuario, setUsuario] = useState(null);

  // Iniciativas favoritas
  const [iniciativasFavoritas, setIniciativasFavoritas] = useState(null);

  // Obtener información de la base de datos
  useEffect(() => {
    const fetchData = async () => {
      const iniciativasData = await getIniciativas();
      setIniciativas(iniciativasData);
      setFilteredIniciativas(iniciativasData.map((iniciativa, index) => ({ item: iniciativa, index })));

      let adminsData = [];
      for (const iniciativa of iniciativasData) {
        const adminData = await getUsuario(iniciativa.idAdmin);
        adminsData.push(adminData);
      }
      setAdmins(adminsData);

      const usuarioData = await getUsuario(user);
      setUsuario(usuarioData);

      const misIniciativasData = await getMisIniciativas(user);
      setIniciativasFavoritas(misIniciativasData.iniciativasFavoritas.map(iniciativa => iniciativa.idIniciativa));
    };
    fetchData();
  }, []);
  
  const searchText = (event) => {
    const searchTerm = event.target.value;
    setFilter(searchTerm);

    if (!searchTerm) {
      // If the search term is empty, show all iniciativas
      setFilteredIniciativas(iniciativas.map((iniciativa, index) => ({ item: iniciativa, index })));
      return;
    }

    const fuse = new Fuse(iniciativas, {
      keys: ['titulo','descripcion'], // Specify the keys you want to search in
      includeScore: true,
      threshold: 0.4, // Adjust the threshold as needed
    });

    const result = fuse.search(searchTerm);
    const filtered = result.map((item) => {
      return { item: item.item, index: item.refIndex }; // Extract the item and its original index
    });
    setFilteredIniciativas(filtered);
  };
  
  const [usuarioEsAdmin, setUsuarioEsAdmin] = useState(false);
  const [usuarioEsMiembro, setUsuarioEsMiembro] = useState(false);
  const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);
  const [suscribirCargando, setSuscribirCargando] = useState(false);

  const handleButtonClick = async (iniciativa, index) => {
    // Verificar si el usuario ya envió una solicitud a la iniciativa
    const solicitudExiste = await existeSolicitud(user, iniciativa.idIniciativa);
    if (solicitudExiste) {
      setSuscribirDesactivado(true);
    } else {
      setSuscribirDesactivado(false);
    }

    setSelectedIniciativa(iniciativa);
    setSelectedIniciativaIndex(index);

    if (iniciativa.listaMiembros.includes(user)) {
      setUsuarioEsMiembro(true);
    } else if (iniciativa.idAdmin === user){
      setUsuarioEsAdmin(true);
    } else {
      setUsuarioEsAdmin(false);
      setUsuarioEsMiembro(false);
    }

    setShowModal(true);
  }

  const handleCrearSolicitud = async () => {
    if (selectedIniciativa) {
      const idIniciativa = selectedIniciativa.idIniciativa; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
      try {
        setSuscribirDesactivado(true);
        setSuscribirCargando(true);
        const solicitud = new Solicitud(user, idIniciativa, "Pendiente", "UsuarioAIniciativa");
        const response = await crearSolicitud(solicitud);
        if (response.success) {
          const iniciativasNuevo = [...iniciativas];
          iniciativasNuevo[selectedIniciativaIndex].listaSolicitudes.push(response.data);
          setIniciativas(iniciativasNuevo);

          const usuarioNuevo = {...usuario};
          usuarioNuevo.listaSolicitudes.push(response.data);
          setUsuario(usuarioNuevo);

          setShowModal(false);
        }
      } catch (error) {
        console.log("Error al enviar solicitud a la iniciativa");
      } finally {
        setSuscribirCargando(false);
      }
    }
  }

  const handleSuscribirse = async () => {
    if (selectedIniciativa) {
      const idIniciativa = selectedIniciativa.idIniciativa; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
      try {
        setSuscribirDesactivado(true);
        setSuscribirCargando(true);
        const response = await suscribirseAIniciativa(user, idIniciativa);
        if (response) {
          const iniciativasNuevo = [...iniciativas];
          iniciativasNuevo[selectedIniciativaIndex].listaMiembros.push(user);
          setIniciativas(iniciativasNuevo);

          const usuarioNuevo = {...usuario};
          usuarioNuevo.listaIniciativasMiembro.push(idIniciativa);
          setUsuario(usuarioNuevo);

          setShowModal(false);
        }
      } catch (error) {
        console.log("Error al enviar solicitud a la iniciativa");
      } finally {
        setSuscribirDesactivado(false);
        setSuscribirCargando(false);
      }
    }
  }

  // Toggle de icono de favoritos
  const handleToggleFavorita = async (idIniciativa) => {
    let iniciativasFavoritasNuevo = [...iniciativasFavoritas];

    if (iniciativasFavoritas.includes(idIniciativa)) {
      iniciativasFavoritasNuevo = iniciativasFavoritas.filter(favorita => favorita !== idIniciativa);
    } else {
      iniciativasFavoritasNuevo.push(idIniciativa);
    }
    setIniciativasFavoritas(iniciativasFavoritasNuevo);

    const usuarioNuevo = {...usuario};
    usuarioNuevo.listaIniciativasFavoritas = iniciativasFavoritasNuevo;
    await actualizaUsuario(usuarioNuevo);
    setUsuario(usuarioNuevo);
  };


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
  const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

  const handleEliminaIniciativa = async () => {
    console.log("Eliminando iniciativa con id: ", selectedIniciativa.idIniciativa);
    handleCerrarEliminar();
    setEliminaBloqueado(true);
    sendMail(selectedIniciativa.idIniciativa);

    try {
      await eliminaIniciativa(selectedIniciativa.idIniciativa);
      handleMostrarEliminada();
    } catch(error) {
      handleMostrarError();
    } finally {
      setEliminaBloqueado(false);
    }
  };

  return (
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
        <div className='e-iniciativas-container' style={!filteredIniciativas ? {justifyContent: "center"} : {}}>
          
          {/* Si no hay iniciativas, mostrar spinner */}
          {filteredIniciativas && admins && iniciativasFavoritas ? (
            filteredIniciativas.map((item, id) => (
            <div key={id} className='e-iniciativa' onClick={() => handleButtonClick(item.item, item.index)}>

              {/* Nombre y foto del usuario administrador*/}
              <div className='e-iniciativa-admin'>
                <img src={admins[item.index].urlImagen} alt = {admins[item.index].nombreUsuario} />
                <div className='e-nombre-admin'>{admins[item.index].nombreUsuario}</div>
              </div>
              
              {/* Imagen de la iniciativa */}
              <div className='e-iniciativa-imagen'>
                <img src={item.item.urlImagen} alt = {item.item.titulo} />
              </div>
              
              {/* Titulo, descripción e ícono */}
              <div className='e-iniciativa-contenido'>
                <div className="e-titulo">{item.item.titulo}</div>
                <div className="e-desc">{item.item.descripcion}</div>
                <div className='e-corazon' onClick={(e) => e.stopPropagation()}>
                  {iniciativasFavoritas.includes(item.item.idIniciativa) ? (
                    <FaHeart onClick={() => handleToggleFavorita(item.item.idIniciativa)} style={{ cursor: "pointer" }} />
                  ) : (
                    <FaRegHeart onClick={() => handleToggleFavorita(item.item.idIniciativa)} style={{ cursor: "pointer" }} />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="spinner">
            <Spinner animation="border" role="status"></Spinner>
          </div>
        )}
        </div>

        {/* Mostrar información adicional */}
        <ModalIniciativa
          showModal={showModal}
          setShowModal={setShowModal}
          selectedIniciativa={selectedIniciativa}
          handleCrearSolicitud={handleCrearSolicitud}
          handleSuscribirse = {handleSuscribirse}
          esAdmin={usuarioEsAdmin}
          esMiembro={usuarioEsMiembro}
          suscribirDesactivado={suscribirDesactivado}
          setSuscribirDesactivado={setSuscribirDesactivado}
          suscribirCargando={suscribirCargando}
          pagina={"Explore"}
        />
      </div>
      
      {/* Modal confirmar eliminar iniciativa*/}
      {selectedIniciativa && (
        <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          <div className="ea-modal-body">
            ¿Estás seguro que quieres eliminar la iniciativa <span style={{fontWeight:'bold'}}>{selectedIniciativa.nombre}</span>?
          </div>
        <Modal.Footer>
          <Button className="eliminar" onClick={handleEliminaIniciativa}>Eliminar</Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal iniciativa eliminada*/}
      {selectedIniciativa && (
        <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Iniciativa <span style={{fontWeight:'bold'}}>{selectedIniciativa.nombre}</span> eliminada exitosamente
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
        </Modal>
      )}

      {/* Modal error eliminar*/}
      {selectedIniciativa && (
        <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
          <Modal.Header>
          <div className="ea-modal-title">Error</div>
          </Modal.Header>
            <div className="ea-modal-body">
              Error al eliminar iniciativa <span style={{fontWeight:'bold'}}>{selectedIniciativa.nombre}</span>
            </div>
          <Modal.Footer>
            <Button onClick={handleCerrarError}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )} 
    </div>

  );
};