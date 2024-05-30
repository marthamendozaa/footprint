import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeart, FaRegHeart, FaSearch, FaTrash } from "react-icons/fa";
import { Modal, Button, Spinner } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { getIniciativas, getUsuarios, getMisIniciativas, actualizaUsuario, crearSolicitud, suscribirseAIniciativa, existeSolicitud, eliminaIniciativa, sendMail, getIntereses, getRegiones } from '../../api/api.js';
import Solicitud from '../../classes/Solicitud.js'
import Fuse from 'fuse.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Explore = () => {
  // Búsqueda y dropdown etiquetas
  const [etiquetas, setEtiquetas] = useState(null);
  const [buscaEtiqueta, setBuscaEtiqueta] = useState("");
  const [resultadosEtiqueta, setResultadosEtiqueta] = useState([]);
  const [dropdownEtiqueta, setDropdownEtiqueta] = useState(false);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);

  // Búsqueda etiquetas
  useEffect(() => {
    if (etiquetas) {
      const resultados = Object.values(etiquetas).filter(etiqueta =>
        etiqueta.toLowerCase().includes(buscaEtiqueta.toLowerCase())
      );
      setResultadosEtiqueta(resultados);
    }
  }, [buscaEtiqueta, etiquetas]);

  // Funciones dropdown etiquetas
  const handleBuscaEtiqueta = (event) => {
    setBuscaEtiqueta(event.target.value);
    setDropdownEtiqueta(true);
  };

  const handleSeleccionaEtiqueta = (etiqueta) => {
    setEtiquetasSeleccionadas(prevState => {
      if (prevState.includes(etiqueta)) {
        return prevState.filter(r => r !== etiqueta);
      } else {
        return [...prevState, etiqueta];
      }
    });
  };

  // Búsqueda y dropdown privacidad
  const [dropdownPrivacidad, setDropdownPrivacidad] = useState(false);
  const [privacidadesSeleccionadas, setPrivacidadesSeleccionadas] = useState([]);

  const togglePrivacidadSeleccionada = (privacidad) => {
    if (privacidadesSeleccionadas.includes(privacidad)) {
      setPrivacidadesSeleccionadas(privacidadesSeleccionadas.filter(p => p !== privacidad));
    } else {
      setPrivacidadesSeleccionadas([...privacidadesSeleccionadas, privacidad]);
    }
  };

  // Búsqueda y dropdown región
  const [regiones, setRegiones] = useState(null);
  const [buscaRegion, setBuscaRegion] = useState("");
  const [resultadosRegion, setResultadosRegion] = useState([]);
  const [dropdownRegion, setDropdownRegion] = useState(false);
  const [regionesSeleccionadas, setRegionesSeleccionadas] = useState([]);

  // Búsqueda regiones
  useEffect(() => {
    if (regiones) {
      const resultados = Object.values(regiones).filter(region =>
        region.toLowerCase().includes(buscaRegion.toLowerCase())
      );
      setResultadosRegion(resultados);
    }
  }, [buscaRegion, regiones]);

  // Funciones dropdown región
  const handleBuscaRegion = (event) => {
    setBuscaRegion(event.target.value);
    setDropdownRegion(true);
  };

  const handleSeleccionaRegion = (region) => {
    setRegionesSeleccionadas(prevState => {
      if (prevState.includes(region)) {
        return prevState.filter(r => r !== region);
      } else {
        return [...prevState, region];
      }
    });
  };


  // Obtener etiquetas y regiones
  useEffect(() => {
    const fetchData = async () => {
      const etiquetasData = await getIntereses();
      setEtiquetas(etiquetasData);

      const regionesData = await getRegiones();
      setRegiones(regionesData);
    };
    fetchData();
  }, []);

  
  // Cerrar dropdowns al hacer click fuera de ellos
  const dropdownEtiquetaRef = useRef(null);
  const dropdownPrivacidadRef = useRef(null);
  const dropdownRegionRef = useRef(null);

  useEffect(() => {
    const handleCerrarDropdown = (event) => {
      if (dropdownEtiquetaRef.current && !dropdownEtiquetaRef.current.contains(event.target)) {
        setDropdownEtiqueta(false);
      }
      if (dropdownPrivacidadRef.current && !dropdownPrivacidadRef.current.contains(event.target)) {
        setDropdownPrivacidad(false);
      }
      if (dropdownRegionRef.current && !dropdownRegionRef.current.contains(event.target)) {
        setDropdownRegion(false);
      }
    };

    document.addEventListener('mousedown', handleCerrarDropdown);
    return () => {
      document.removeEventListener('mousedown', handleCerrarDropdown);
    };
  }, []);


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


  // Manejar filtros de búsqueda
  useEffect(() => {
    if (iniciativasFiltradas) {
      setIniciativasFiltradas(iniciativas.filter(iniciativa => {
        // Si se borran los filtros, mostrar todas las iniciativas
        let filtroEtiqueta = etiquetasSeleccionadas.length === 0 ? true : false;
        let filtroPrivacidad = privacidadesSeleccionadas.length === 0 ? true : false;
        let filtroRegion = regionesSeleccionadas.length === 0 ? true : false;

        // Filtrar por etiquetas
        const etiquetasIniciativa = Object.values(iniciativa.listaEtiquetas);
        for (let etiqueta of etiquetasIniciativa) {
          if (etiquetasSeleccionadas.includes(etiqueta)) {
            filtroEtiqueta = true;
            break;
          }
        };
        
        // Filtrar por privacidad
        const privacidadIniciativa = iniciativa.esPublica ? "Pública" : "Privada";
        if (privacidadesSeleccionadas.includes(privacidadIniciativa)) {
          filtroPrivacidad = true;
        }

        // Filtrar por región
        const regionIniciativa = iniciativa.region;
        if (regionesSeleccionadas.includes(regionIniciativa)) {
          filtroRegion = true;
        }

        return filtroEtiqueta && filtroPrivacidad && filtroRegion;
      }));
    }
  }, [etiquetasSeleccionadas, privacidadesSeleccionadas, regionesSeleccionadas]);
  

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

        {/* Filtros dropdowns */}
        {etiquetas && regiones && (
          <div className="e-filtros-container">
            <div className="e-filtros-titulo">Filtrar por:</div>

            {/* Dropdown etiquetas */}
            <div className="c-dropdown-container" ref={dropdownEtiquetaRef}>
              <button className="c-selecciona-dropdown" onClick={() => setDropdownEtiqueta(!dropdownEtiqueta)}>
                <span className="mr-2">Etiquetas</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownEtiqueta && (
                <div className="c-dropdown">
                  {/* Input búsqueda etiqueta */}
                  <input className="c-dropdown-input" type="text" placeholder="Buscar..." autoComplete="off" value={buscaEtiqueta} onChange={handleBuscaEtiqueta} />
                  {/* Resultados búsqueda etiqueta */}
                  {resultadosEtiqueta.map((etiqueta, idEtiqueta) => (
                    <label key={idEtiqueta} className="e-dropdown-item">
                      <input
                        type="checkbox"
                        checked={etiquetasSeleccionadas.includes(etiqueta)}
                        onChange={() => handleSeleccionaEtiqueta(etiqueta)}
                      />
                      {etiqueta}
                    </label>
                  ))}
                </div>
              )}

            </div>
            
            {/* Dropdown privacidad */}
            <div className="c-dropdown-container" ref={dropdownPrivacidadRef}>
              <button className="c-selecciona-dropdown" onClick={() => setDropdownPrivacidad(!dropdownPrivacidad)}>
                <span className="mr-2">Privacidad</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Opciones de privacidad */}
              {dropdownPrivacidad && (
                <div className="c-dropdown">
                  <label className="e-dropdown-item">
                    <input type="checkbox" checked={privacidadesSeleccionadas.includes("Pública")} onChange={() => togglePrivacidadSeleccionada("Pública")} /> Pública
                  </label>
                  <label className="e-dropdown-item">
                    <input type="checkbox" checked={privacidadesSeleccionadas.includes("Privada")} onChange={() => togglePrivacidadSeleccionada("Privada")} /> Privada
                  </label>
                </div>
              )}

            </div>
            
            {/* Dropdown región */}
            <div className="c-dropdown-container" ref={dropdownRegionRef}>
              <button className="c-selecciona-dropdown" onClick={() => setDropdownRegion(!dropdownRegion)}>
                <span className="mr-2">Ubicación</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownRegion && (
                <div className="c-dropdown">
                  {/* Input búsqueda región */}
                  <input className="c-dropdown-input" type="text" placeholder="Buscar..." autoComplete="off" value={buscaRegion} onChange={handleBuscaRegion} />
                  {/* Resultados búsqueda región */}
                  {resultadosRegion.map((region, idRegion) => (
                    <label key={idRegion} className="e-dropdown-item">
                      <input
                        type="checkbox"
                        checked={regionesSeleccionadas.includes(region)}
                        onChange={() => handleSeleccionaRegion(region)}
                      />
                      {region}
                    </label>
                  ))}
                </div>
              )}

            </div>

            <div className="e-filtros-borrar">Borrar</div>
          </div>
        )}

        {/* Iniciativas */}
        <div className='e-iniciativas-container' style={iniciativasFiltradas && iniciativasFavoritas ? {} : {justifyContent: "center"}}>
          
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