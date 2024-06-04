import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getIniciativa, getMiembros, getMisTareas, getUsuario, getUsuarios, getSolicitudes, actualizaSolicitud, suscribirseAIniciativa, eliminarMiembro, sendRemoveMail, crearSolicitud, existeSolicitud } from '../../api/api.js';
import Solicitud from '../../classes/Solicitud.js'
import Fuse from 'fuse.js';
import './Initiative.css';

export const Initiative = () => {
 // Miembro seleccionado a eliminar
 const [miembroEliminar, setMiembroEliminar] = useState(null);
 const [idMiembroEliminar, setIdMiembroEliminar] = useState(null);

 // Modal de confirmación de eliminación
 const [modalEliminar, setModalEliminar] = useState(false);
 const handleCerrarEliminar = () => setModalEliminar(false);
 const handleMostrarEliminar = (miembro, idMiembro) => {
   setMiembroEliminar(miembro.nombreUsuario);
   setIdMiembroEliminar(idMiembro);
   setModalEliminar(true);
 }

 // Modal de iniciativa eliminada
 const [modalEliminada, setModalEliminada] = useState(false);
 const handleMostrarEliminada = () => setModalEliminada(true);
 const handleCerrarEliminada = async () => {
   setModalEliminada(false);
   //const dataMiembros = await getMiembros();
   //setMiembros(dataMiembros);
   await actualizarMiembros();
 }

 // Modal de error
 const [modalError, setModalError] = useState(false);
 const handleMostrarError = () => setModalError(true);
 const handleCerrarError = () => setModalError(false);

 // Eliminar iniciativa
 const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

 const handleEliminaMiembro = async () => {
   console.log("Eliminando miembro con id: ", idMiembroEliminar);
   handleCerrarEliminar();
   setEliminaBloqueado(true);
   sendRemoveMail(idIniciativa, idMiembroEliminar);

   try {
     await eliminarMiembro(idIniciativa, idMiembroEliminar);
     handleMostrarEliminada();
   } catch(error) {
     handleMostrarError();
   } finally {
     setEliminaBloqueado(false);
   }
 };

  const { idIniciativa } = useParams();
  const [iniciativa, setIniciativa] = useState(null);
  const [infoAdmin, setInfoAdmin] = useState(null);
  const [miembros, setMiembros] = useState(null);
  const [tareas, setTareas] = useState(null);

  //LO QUE AÑADI DE CHECAR SI ES ADMIN
  const { user } = useAuth();
  const [esAdmin, setEsAdmin] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [showSolicitudesModal, setShowSolicitudesModal] = useState(false); 
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);
  const [usuariosRecibidos, setUsuariosRecibidos] = useState(null);

  //Búsqueda de usuarios para agregar miembros
  const [showInvitarModal, setShowInvitarModal] = useState(false); 
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [invitarCargando, setInvitarCargando] = useState(false); //Implementar?
  const [usuariosDesactivados, setUsuariosDesactivados] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        console.log(iniciativaData);

        const infoIniciativaAdmin = await getUsuario(iniciativaData.idAdmin);
        setInfoAdmin(infoIniciativaAdmin);
        console.log(infoIniciativaAdmin);

        const usuarioData = await getUsuario(user); 
        setEsAdmin(usuarioData.idUsuario === iniciativaData.idAdmin);

        await actualizarMiembros();

        const usuariosData = await getUsuarios();

        const usuariosSinMiembros = Object.values(usuariosData).filter(usuario => 
          usuario.idUsuario !== iniciativaData.idAdmin &&
          !iniciativaData.listaMiembros.includes(usuario.idUsuario) && !usuario.esAdmin
        );

        setUsuarios(usuariosSinMiembros);
        setUsuariosFiltrados(usuariosSinMiembros);
        console.log("usuarios:", usuariosSinMiembros);

        const solicitudes = await getSolicitudes("Iniciativas", idIniciativa);
        console.log(solicitudes);

        let solicitudesRecibidasData = []
        for (const solicitud of solicitudes) {
          if (solicitud.tipoInvitacion == "UsuarioAIniciativa" && solicitud.estado == "Pendiente") {
            solicitudesRecibidasData.push(solicitud);
          }
        }
        setSolicitudesRecibidas(solicitudesRecibidasData);

        let usuariosRecibidosData = []
        for (const solicitud of solicitudesRecibidasData){
          const usuarioRecibido = await getUsuario(solicitud.idUsuario);
          usuariosRecibidosData.push(usuarioRecibido);
        }
        setUsuariosRecibidos(usuariosRecibidosData);

        const tareaPromises = iniciativaData.listaTareas.map(async (idTarea) => {
          const tareaData = await getMisTareas(idTarea);
          return tareaData;
        });
        const tareas = await Promise.all(tareaPromises);
        setTareas(tareas);

      } catch (error) {
        console.error("Error obteniendo información de la iniciativa:", error.message);
      }
    };
    fetchData();
  }, [idIniciativa]);

  useEffect(() => {
    const verificarSolicitudes = async () => {
      let desactivados = {};
      for (const usuario of usuariosFiltrados) {
        const existe = await existeSolicitud(usuario.idUsuario, idIniciativa);
        desactivados[usuario.idUsuario] = existe;
      }
      setUsuariosDesactivados(desactivados);
    };
  
    if (usuariosFiltrados && usuariosFiltrados.length > 0) {
      verificarSolicitudes();
    }
  }, [usuariosFiltrados]);

  const ProgressBar = ({ progress }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-label">{`${progress}%`}</div>
      </div>
    );
  };

  const handleShowSolicitudesModal = () => {
    setShowSolicitudesModal(true);
  };

  const handleShowInvitarModal = () => {
    setShowInvitarModal(true);
  };

  const buscarUsuario = (event) => {
    const busqueda = event.target.value;
    setFiltro(busqueda);

    if (!busqueda) {
      // Si el término de búsqueda está vacío, mostrar todos los usuarios
      setUsuariosFiltrados(usuarios);
      return;
    }

    const fuse = new Fuse(usuarios, {
      keys: ['nombreUsuario', 'nombre'], // Especificar las claves para buscar
      includeScore: true,
      threshold: 0.4, // Ajustar el umbral según sea necesario
    });

    const resultado = fuse.search(busqueda);
    const filtradas = resultado.map((item) => item.item);
    setUsuariosFiltrados(filtradas);
    console.log(usuariosFiltrados);
    
  };

  const handleInvitarUsuario = async (index, idUsuario) => {
    let usuariosNuevo = [...usuarios];
    try {
      // Crear solicitud
      setInvitarCargando(true);
      const solicitud = new Solicitud(idUsuario, idIniciativa, "Pendiente", "IniciativaAUsuario");
      const response = await crearSolicitud(solicitud);
  
      // Actualizar la lista de solicitudes de la iniciativa y del miembro
      if (response.success) {
        iniciativa.listaSolicitudes.push(response.data);
        usuariosNuevo[index].listaSolicitudes.push(response.data);
  
        // Actualizar el estado de desactivación
        setUsuariosDesactivados((prev) => ({ ...prev, [idUsuario]: true }));
  
        // Cierra el modal
        setShowInvitarModal(false);
      }
    } catch (error) {
      console.log("Error al enviar solicitud a la iniciativa");
    } finally {
      setInvitarCargando(false);
    }
  };
  

  const handleAceptarSolicitud = async(index) => {
    //Actualizar Estatus de solicitud
    let solicitudesRecibidasNuevo = solicitudesRecibidas;
    solicitudesRecibidasNuevo[index].estado = "Aceptada";
    const solicitud = solicitudesRecibidasNuevo[index];
    setSolicitudesRecibidas(solicitudesRecibidasNuevo);
    await actualizaSolicitud(solicitud);

    //Actualizar listaIniciativasMiembro del usuario que hizo la solicitud
    const user = solicitudesRecibidasNuevo[index].idUsuario;
    await suscribirseAIniciativa(user, idIniciativa);
  };

  const handleRechazarSolicitud = async(index) => {
    let solicitudesRecibidasNuevo = solicitudesRecibidas;
    solicitudesRecibidasNuevo[index].estado = "Rechazada";
    const solicitud = solicitudesRecibidasNuevo[index];
    setSolicitudesRecibidas(solicitudesRecibidasNuevo);
    await actualizaSolicitud(solicitud);
  };

  const actualizarMiembros = async () => {
    try {
      const dataMiembros = await getMiembros(idIniciativa);
      setMiembros(dataMiembros);
    } catch (error) {
      console.error("Error obteniendo miembros:", error.message);
    }
  };

  return (
    <div>
      {iniciativa ? (
        <div className="i-container">
          <div className="i-iniciativa-container">
            {/* Foto de iniciativa */}
            <img src={iniciativa.urlImagen} className="i-foto-iniciativa"/> 
            
            <div className="i-info-container"> 
              {/* Título */}
              <div className="i-titulo">
                <div className="i-titulo-texto">{iniciativa.titulo}</div>
              </div>
  
            {/* Etiquetas */}
            <div className="i-etiquetas">
              {Object.values(iniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                <li key={idEtiqueta} className={`i-etiqueta-item`}>
                  {etiqueta}
                </li>
              ))}
            </div>
  
            <div className="i-datos">
              {/* Fecha inicio y fecha cierre */}
              <div className="i-calendarios-container">
                <div className="i-calendarios">
                  {/* Fecha inicio */}
                  <div className="i-calendario-container">
                    <div className="i-calendario">
                      <div className="i-icono-calendario">
                        <FaCalendar/>
                      </div>
                    </div>
                    <div className='i-fecha'>{iniciativa.fechaInicio}</div>
                  </div>
                  
                  {/* Dash */}
                  <div className="i-calendario-separador"> - </div>

                  {/* Fecha cierre */}
                  <div className="i-calendario-container">
                    <div className="i-calendario">
                      <div className="i-icono-calendario">
                        <FaCalendar/>
                      </div>
                    </div>
                    <div className='i-fecha'>{iniciativa.fechaCierre}</div>
                  </div>
                </div>
              </div>

              {/* Privacidad */}
              <div className="i-dato-container">
                <div className="i-dato">
                  {iniciativa.esPublica ? "Pública" : "Privada"}
                </div>
              </div>
  
              {/* Ubicación */}
              <div className="i-dato-container">
                <div className="i-dato">
                  {iniciativa.region}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Descripción */}
        <div className="i-desc">
          <div className="i-progreso-texto">Progreso</div>
          <ProgressBar progress={50} />
          <div className="i-desc-texto">
            {iniciativa.descripcion}
          </div>
        </div>
          
        {/* Tareas y Miembros*/}
        <div className="i-tareas-miembros">
          <div className="i-seccion-tareas">
            <div className="i-tareas-seccion">
              {/* Tarea asignada a mí */}
              <div className="i-titulo-tareas">Mis Tareas</div>
                {tareas ? (
                  <div className='i-tareas-container'>
                    {tareas.length === 0 ? (
                      <div className="m-error">
                      No hay tareas asignadas.
                      </div>
                    ) : (
                    <div>
                      {tareas.map((tarea, idTarea) => (
                        <div className="i-tarea" key={idTarea}>
                          <div className="i-tarea-info">
                            <div className="i-tarea-texto">
                              <div className="i-tarea-titulo">{tarea.titulo}</div>
                              <div className="i-tarea-desc">{tarea.descripcion}</div>
                            </div>
                            <div className="i-tarea-botones">
                              <div className="i-tarea-boton"><FaCalendar /> Fecha {formatDate(tarea.fechaEntrega)}</div>
                              <div className="i-tarea-boton"><FaFolder /> Documento</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                  ) : (
                  <div className="m-error">
                  No hay tareas asignadas.
                  </div>
                )}
            </div>
          </div>

          <div className="i-seccion-miembros">
            <div className="i-tipo-miembro">Dueño</div>
            {infoAdmin && 
              <button type="button" className="i-btn-miembro">{infoAdmin.nombreUsuario}</button> 
            }
            <div className="i-tipo-miembro">Miembros</div>
            <div>
              <button type="button" className="i-btn-ver-solicitudes" onClick={handleShowInvitarModal}>
                Agregar miembro
              </button>
            </div>
            {miembros ? (
                  <div>
                    {miembros.length === 0 ? (
                      <div>
                      No hay miembros.
                      </div>
                    ) : (
                    <div>
                      {miembros.map((miembro, idMiembro) => (
                        <div key={idMiembro}>
                          <button type="button" className="i-btn-miembro">{miembro.nombreUsuario}
                          { esAdmin && (
                          <span className="i-icono-elimina-miembro">
                            <FaTimesCircle  onClick={() => handleMostrarEliminar(miembro, miembro.idUsuario)} disabled={eliminaBloqueado} className="i-icon-times-circle" />
                          </span>
                          )}
                        </button>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                  ) : (
                  <div className="m-error">
                  No hay miembros.
                  </div>
                )}
                {!iniciativa.esPublica && (
                  <button type="button" className="i-btn-ver-solicitudes" onClick={handleShowSolicitudesModal}>
                  VER SOLICITUDES
                </button>
                )}              
            </div>
          </div>
        </div>
      ):(
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      ) }

      {/* Modal confirmar eliminar iniciativa*/}
      <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          <div className="ea-modal-body">
            ¿Estás seguro que quieres eliminar a <span style={{fontWeight:'bold'}}>{miembroEliminar}</span>?
          </div>
        <Modal.Footer>
          <Button className="eliminar" onClick={handleEliminaMiembro}>Eliminar</Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal iniciativa eliminada*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Miembro <span style={{fontWeight:'bold'}}>{miembroEliminar}</span> eliminado exitosamente
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
            Error al eliminar miembro <span style={{fontWeight:'bold'}}>{miembroEliminar}</span>
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarError}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal revisar solicitudes*/}
      <Modal show={showSolicitudesModal} onHide={() => setShowSolicitudesModal(false)} centered className='e-modal'>
        <div className="modalcontainer">
            <Modal.Header style={{ border: "none" }} closeButton> Solicitudes </Modal.Header>
            
            <div>
              {!usuariosRecibidos ? (
                  <div className="m-error">
                    Esta iniciativa no ha recibido solicitudes.
                  </div>
                ) : (
                  <div className="m-iniciativas-container">
                    {usuariosRecibidos.map((usuario, index) => (
                      <div key={index} className='e-iniciativa'>
                        <div className="e-desc">{usuario.nombreUsuario}</div>
                      <div className='e-iniciativa-imagen'>
                          <img src={usuario.urlImagen} alt = {usuario.nombreUsuario} />
                      </div>
    
                      <div className='e-iniciativa-texto'>
                          <div className="e-titulo">{usuario.nombre}</div>
                          <div className="i-etiquetas">
                          {Object.values(usuario.listaHabilidades).map((habilidad, idHabilidad) => (
                            <li key={idHabilidad} className={`i-etiqueta-item`}>
                              {habilidad}
                            </li>
                          ))}
                          <div>
                            <button onClick={() => handleAceptarSolicitud(index)}>Aceptar</button>
                            <button onClick={() => handleRechazarSolicitud(index)}>Rechazar</button>
                          </div>
                        </div>
                      </div>
                    </div>    
                    ))}
                  </div>
                )}
            </div>
        </div>
    </Modal>

    {/*Modal para inivtar usuarios*/}
    <Modal show={showInvitarModal} onHide={() => setShowInvitarModal(false)} centered className='e-modal'>
      <div className="modalcontainer">
        <Modal.Header closeButton>
          <Modal.Title>Invitar Usuarios</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <div className='e-searchBar'>
              <FaSearch className="e-icons"/>
              <input
                type='search'
                placeholder='Buscar usuarios...'
                value={filtro}
                onChange={buscarUsuario}
                className='e-searchBarCaja'
              />
            </div>
            {usuariosFiltrados && usuariosFiltrados.length > 0 ? (
              <ul>
                {usuariosFiltrados.map((usuario, id) => (
                  <li key={id} className='user-item'>
                    <div className='user-info'>
                      <span>{usuario.nombreUsuario}</span> ({usuario.nombre})
                    </div>
                    <Button
                      variant="primary"
                      disabled={usuariosDesactivados[usuario.idUsuario]}
                      onClick={() => handleInvitarUsuario(id, usuario.idUsuario)}
                    >
                      Invitar</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="spinner">
                <Spinner animation="border" role="status"></Spinner>
              </div>
            )}
          </Modal.Body>  
      </div>
    </Modal>

    </div>
  );
};