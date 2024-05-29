import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeart, FaRegHeart, FaSearch, FaTrash } from "react-icons/fa";
import { Modal, Button, Spinner } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { getIniciativas, getUsuarios, getMisIniciativas, actualizaUsuario, crearSolicitud, suscribirseAIniciativa, existeSolicitud, eliminaIniciativa, sendMail } from '../../api/api.js';
import Solicitud from '../../classes/Solicitud.js'
import Fuse from 'fuse.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Explore = () => {
  // Iniciativas
  const [filtro, setFiltro] = useState('');
  const [iniciativas, setIniciativas] = useState(null);
  const [iniciativasFiltradas, setIniciativasFiltradas] = useState(null);
  const [iniciativasFavoritas, setIniciativasFavoritas] = useState(null);

  // Usuario actual
  const { user, admin } = useAuth();
  const [usuario, setUsuario] = useState(null);

  // Obtener información de la base de datos
  useEffect(() => {
    const fetchData = async () => {
      // Obtiene todos los usuarios e iniciativas
      const usuariosData = await getUsuarios();
      const iniciativasData = await getIniciativas();

      // Asigna el nombre y la imagen del admin a cada iniciativa
      for (let i = 0; i < iniciativasData.length; i++) {
        const admin = usuariosData[iniciativasData[i].idAdmin];
        iniciativasData[i].nombreAdmin = admin.nombreUsuario;
        iniciativasData[i].urlImagenAdmin = admin.urlImagen;
      }

      setIniciativas(iniciativasData);
      setIniciativasFiltradas(iniciativasData);
      setUsuario(usuariosData[user]);
      
      // Obtiene las iniciativas favoritas del usuario
      if (admin) {
        setIniciativasFavoritas([]);
      } else {
        const misIniciativasData = await getMisIniciativas(user);
        setIniciativasFavoritas(misIniciativasData.iniciativasFavoritas.map(iniciativa => iniciativa.idIniciativa));
      }
    };
    fetchData();
  }, []);
  

  // Búsqueda difusa de palabras clave
  const buscarIniciativa = (event) => {
    const busqueda = event.target.value;
    setFiltro(busqueda);

    // Mostrar todas las iniciativas si no hay término de búsqueda
    if (!busqueda) {
      setIniciativasFiltradas(iniciativas);
      return;
    }

    // Realizar la búsqueda difusa
    const fuse = new Fuse(iniciativas, {
      keys: ['titulo','descripcion'],
      includeScore: true,
      threshold: 0.4,
    });

    // Filtrar las iniciativas que coincidan con el término de búsqueda
    const resultado = fuse.search(busqueda);
    const filtradas = resultado.map((item) => item.item);
    setIniciativasFiltradas(filtradas);
  };
  

  // Seleccionar una iniciativa
  const [showModalIniciativa, setShowModalIniciativa] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);
  const [seleccionadaIndice, setSeleccionadaIndice] = useState(null);

  // Mostrar la información de la iniciativa seleccionada
  const [usuarioEsAdmin, setUsuarioEsAdmin] = useState(false);
  const [usuarioEsMiembro, setUsuarioEsMiembro] = useState(false);
  const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);
  const [suscribirCargando, setSuscribirCargando] = useState(false);


  const seleccionaIniciativa = async (iniciativa, indice) => {
    if (!admin) {
      // Verificar si el usuario ya envió una solicitud a la iniciativa
      const solicitudExiste = await existeSolicitud(user, iniciativa.idIniciativa);
      if (solicitudExiste) {
        setSuscribirDesactivado(true);
      } else {
        setSuscribirDesactivado(false);
      }

      // Verificar si el usuario es miembro o administrador de la iniciativa
      if (iniciativa.listaMiembros.includes(user)) {
        setUsuarioEsMiembro(true);
      } else if (iniciativa.idAdmin === user){
        setUsuarioEsAdmin(true);
      } else {
        setUsuarioEsAdmin(false);
        setUsuarioEsMiembro(false);
      }
    }
    
    // Selecciona iniciativa
    setSeleccionada(iniciativa);
    setSeleccionadaIndice(indice);

    // Muestra información de la iniciativa
    setShowModalIniciativa(true);
  }


  // Crear solicitud para unirse a la iniciativa
  const handleCrearSolicitud = async () => {
    const idIniciativa = seleccionada.idIniciativa;
    try {
      // Crear solicitud
      setSuscribirDesactivado(true);
      setSuscribirCargando(true);
      const solicitud = new Solicitud(user, idIniciativa, "Pendiente", "UsuarioAIniciativa");
      const response = await crearSolicitud(solicitud);

      // Actualizar la lista de solicitudes de la iniciativa y del miembro
      if (response.success) {
        const iniciativasNuevo = [...iniciativas];
        iniciativasNuevo[seleccionadaIndice].listaSolicitudes.push(response.data);
        setIniciativas(iniciativasNuevo);

        const usuarioNuevo = {...usuario};
        usuarioNuevo.listaSolicitudes.push(response.data);
        setUsuario(usuarioNuevo);
        
        // Cierra el modal
        setShowModalIniciativa(false);
      }
    } catch (error) {
      console.log("Error al enviar solicitud a la iniciativa");
    } finally {
      setSuscribirCargando(false);
    }
  }


  // Suscribe el usuario a la iniciativa
  const handleSuscribirse = async () => {
    const idIniciativa = seleccionada.idIniciativa;
    try {
      // Suscribirse a la iniciativa
      setSuscribirDesactivado(true);
      setSuscribirCargando(true);
      const response = await suscribirseAIniciativa(user, idIniciativa);

      // Actualizar la lista de miembros de la iniciativa y del usuario
      if (response) {
        const iniciativasNuevo = [...iniciativas];
        iniciativasNuevo[seleccionadaIndice].listaMiembros.push(user);
        setIniciativas(iniciativasNuevo);

        const usuarioNuevo = {...usuario};
        usuarioNuevo.listaIniciativasMiembro.push(idIniciativa);
        setUsuario(usuarioNuevo);
        
        // Cierra el modal
        setShowModalIniciativa(false);
      }
    } catch (error) {
      console.log("Error al enviar solicitud a la iniciativa");
    } finally {
      setSuscribirDesactivado(false);
      setSuscribirCargando(false);
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

    // Actualiza información del usuario con lista de favoritas nueva
    const usuarioNuevo = {...usuario};
    usuarioNuevo.listaIniciativasFavoritas = iniciativasFavoritasNuevo;
    await actualizaUsuario(usuarioNuevo);
    setUsuario(usuarioNuevo);
  };


  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const handleCerrarEliminar = () => setModalEliminar(false);
  const handleMostrarEliminar = (iniciativa) => {
    setSeleccionada(iniciativa);
    setModalEliminar(true);
  }

  // Modal de iniciativa eliminada
  const [modalEliminada, setModalEliminada] = useState(false);
  const handleMostrarEliminada = () => setModalEliminada(true);
  const handleCerrarEliminada = async () => {
    setModalEliminada(false);
    const iniciativasData = iniciativas.filter(iniciativa => iniciativa.idIniciativa !== seleccionada.idIniciativa);
    setIniciativas(iniciativasData);
    setIniciativasFiltradas(iniciativasData);
  }

  // Modal de error
  const [modalError, setModalError] = useState(false);
  const handleMostrarError = () => setModalError(true);
  const handleCerrarError = () => setModalError(false);

  // Eliminar iniciativa
  const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

  const handleEliminaIniciativa = async () => {
    setEliminaBloqueado(true);
    sendMail(seleccionada.idIniciativa);

    try {
      await eliminaIniciativa(seleccionada.idIniciativa);
    } catch (error) {
      handleMostrarError();
    } finally {
      setEliminaBloqueado(false);
      handleCerrarEliminar();
      handleMostrarEliminada();
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
            value={filtro}
            onChange={buscarIniciativa}
            className='e-searchBarCaja'
          />
        </div>

        {/* Iniciativas */}
        <div className='e-iniciativas-container' style={!iniciativasFiltradas ? {justifyContent: "center"} : {}}>
          
          {/* Si no hay iniciativas, mostrar spinner */}
          {iniciativasFiltradas && iniciativasFavoritas ? (
            iniciativasFiltradas.map((iniciativa, indice) => (
            <div key={indice} className='e-iniciativa' onClick={() => seleccionaIniciativa(iniciativa, indice)}>

              {/* Nombre y foto del usuario administrador*/}
              <div className='e-iniciativa-admin'>
                <img src={iniciativa.urlImagenAdmin} alt = {iniciativa.nombreAdmin} />
                <div className='e-nombre-admin'>{iniciativa.nombreAdmin}</div>
              </div>
              
              {/* Imagen de la iniciativa */}
              <div className='e-iniciativa-imagen'>
                <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
              </div>
              
              {/* Titulo, descripción, y botón */}
              <div className='e-iniciativa-contenido'>
                <div className="e-titulo">{iniciativa.titulo}</div>
                <div className="e-desc">{iniciativa.descripcion}</div>

                {/* Botón */}
                <div className='e-boton' onClick={(e) => e.stopPropagation()}>
                  {admin ? (
                    <FaTrash onClick={() => handleMostrarEliminar(iniciativa)} style={{ cursor: "pointer" }} />
                  ) : (
                    iniciativasFavoritas.includes(iniciativa.idIniciativa) ? (
                      <FaHeart onClick={() => handleToggleFavorita(iniciativa.idIniciativa)} style={{ cursor: "pointer" }} />
                    ) : (
                      <FaRegHeart onClick={() => handleToggleFavorita(iniciativa.idIniciativa)} style={{ cursor: "pointer" }} />
                    )
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
          showModal={showModalIniciativa}
          setShowModal={setShowModalIniciativa}
          selectedIniciativa={seleccionada}
          handleCrearSolicitud={handleCrearSolicitud}
          handleSuscribirse = {handleSuscribirse}
          esAdmin={usuarioEsAdmin}
          esMiembro={usuarioEsMiembro}
          suscribirDesactivado={suscribirDesactivado}
          setSuscribirDesactivado={setSuscribirDesactivado}
          suscribirCargando={suscribirCargando}
          pagina={admin ? "" : "Explore"}
        />
      </div>
      
      {/* Modal confirmar eliminar iniciativa*/}
      {seleccionada && (
        <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          <div className="ea-modal-body">
            ¿Estás seguro que quieres eliminar la iniciativa <span style={{fontWeight:'bold'}}>{seleccionada.titulo}</span>?
          </div>
        <Modal.Footer>
          <Button className="eliminar" onClick={handleEliminaIniciativa} disabled={eliminaBloqueado} style={{width: "119px"}}>
            {eliminaBloqueado ? <ClipLoader color="white" size={15} /> : "Eliminar"}
          </Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal iniciativa eliminada*/}
      {seleccionada && (
        <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Iniciativa <span style={{fontWeight:'bold'}}>{seleccionada.titulo}</span> eliminada exitosamente
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
        </Modal>
      )}

      {/* Modal error eliminar*/}
      {seleccionada && (
        <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
          <Modal.Header>
          <div className="ea-modal-title">Error</div>
          </Modal.Header>
            <div className="ea-modal-body">
              Error al eliminar iniciativa <span style={{fontWeight:'bold'}}>{seleccionada.titulo}</span>
            </div>
          <Modal.Footer>
            <Button onClick={handleCerrarError}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )} 
    </div>

  );
};