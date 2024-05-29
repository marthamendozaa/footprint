import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle  } from 'react-icons/fa';
import { FaClock } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { useAuth } from '../../contexts/AuthContext';
import { MdUpload } from "react-icons/md"
import { Spinner, Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getIniciativa, getMiembros, getMisTareas, getUsuario, getSolicitudes, actualizaSolicitud, suscribirseAIniciativa, eliminarMiembro, sendRemoveMail } from '../../api/api.js';
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
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [showModal, setShowModal] = useState(false); 
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);
  const [usuariosRecibidos, setUsuariosRecibidos] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        console.log(iniciativaData);

        const infoIniciativaAdmin = await getUsuario(iniciativaData.idAdmin);
        setInfoAdmin(infoIniciativaAdmin);
        console.log(infoIniciativaAdmin);


        const usuarioData = await getUsuario(user); // Assuming this gets the current logged-in user
        setUsuario(usuarioData);
        setEsAdmin(usuarioData.idUsuario === iniciativaData.idAdmin);

        
        await actualizarMiembros();

        //const listaMiembros = await getMiembros(idIniciativa);
        //setMiembros(listaMiembros);

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

  const ProgressBar = ({ progress }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-label">{`${progress}%`}</div>
      </div>
    );
  };

  const handleShowModal = () => {
    setShowModal(true);
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
                  <button type="button" className="i-btn-ver-solicitudes" onClick={handleShowModal}>
                  VER SOLICITUDES
                </button>
                )}
              
            </div>

              <Modal show={showModal} onHide={() => setShowModal(false)} centered className='e-modal'>
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
          </div>
        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}

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

    </div>
  );
};