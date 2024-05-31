import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationCircle , FaPen, FaCalendar, FaFolder, FaTimesCircle, FaGlobe, FaUnlockAlt, FaLock } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import es from 'date-fns/locale/es';
import { getIntereses, getIniciativa, getMiembros, getMisTareas, getUsuario, getSolicitudes, subirImagen, actualizaSolicitud, suscribirseAIniciativa, eliminarMiembro, sendRemoveMail } from '../../api/api.js';
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

 // Modal de miembro eliminado
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

 // Eliminar miembro
 const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

 const handleEliminaMiembro = async () => {
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

  const [imagenPreview, setImagenPreview] = useState(null);
  const [nuevaFechaFinal, setNuevaFechaFinal] = useState(null);

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

  const [showModal, setShowModal] = useState(false); 
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);
  const [usuariosRecibidos, setUsuariosRecibidos] = useState(null);


  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadDisabled, setUploadDisabled] = useState(true);
  const [cargandoTarea, setCargandoTarea] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const openUploadModal = (taskId) => {
    setShowUploadModal(true);
    setFileError('');
    setSelectedTaskId(taskId);
  };

  const closeUploadModal = () => {
    setCargandoTarea(false);
    setShowUploadModal(false);
    setSelectedFile(null);
    setSelectedTaskId(null);
  };

  useEffect(() => {
    if (cargandoTarea) {
      setUploadDisabled(true);
    }

    if (!selectedFile) {
      setUploadDisabled(true);
      return;
    }
    
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError('El archivo seleccionado supera el límite de tamaño de 10 MB');
      setSelectedFile(null);
      setUploadDisabled(true);
    } else {
      setFileError('');
      setUploadDisabled(false);
    }
  }, [selectedFile, cargandoTarea]);

  const handleUploadFile = async () => {
    setUploadDisabled(true);
    setCargandoTarea(true);

    try {
      const fileUrl = await subirImagen(selectedFile, `Tareas/${selectedTaskId}`);
      // Handle fileUrl appropriately in your application context
      closeUploadModal();
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
    } 
  };

  const { getRootProps: getRootPropsTarea, getInputProps: getInputPropsTarea } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileError('');
      }
    }
  });


  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        setImagenPreview(iniciativaData.urlImagen)

        const fechaCierre = iniciativaData.fechaCierre ? parseDate(iniciativaData.fechaCierre) : null;
        setNuevaFechaFinal(fechaCierre);

        const infoIniciativaAdmin = await getUsuario(iniciativaData.idAdmin);
        setInfoAdmin(infoIniciativaAdmin);

        const usuarioData = await getUsuario(user);
        setEsAdmin(usuarioData.idUsuario === iniciativaData.idAdmin);
        
        await actualizarMiembros();

        const solicitudes = await getSolicitudes("Iniciativas", idIniciativa);

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

  // Editar la información
  const [editingCampos, setEditingCampos] = useState(false);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    setToday(new Date());
  }, []);


  const handleCamposEdit = () => {
    setEditingCampos(true);
    setNuevoTitulo(iniciativa.titulo);
    setNuevaDescripcion(iniciativa.descripcion)

    const nuevaEtiquetasIniciativa = {...etiquetasIniciativa};
    Object.values(iniciativa.listaEtiquetas).forEach((etiquetaExistente) => {
      const idEtiquetaExistente = Object.keys(etiquetas).find(key => etiquetas[key] === etiquetaExistente);
      if (idEtiquetaExistente && !nuevaEtiquetasIniciativa[idEtiquetaExistente]) {
        nuevaEtiquetasIniciativa[idEtiquetaExistente] = etiquetaExistente;
      }
    });
    setEtiquetasIniciativa(nuevaEtiquetasIniciativa);
  };

  // Editar imagen
  const [imagenBloqueado, setImagenBloqueado] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenIniciativa, setImagenIniciativa] = useState(null);
  
  const [modalImagen, setModalImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const handleMostrarImagen = () => setModalImagen(true);
  
  const handleCerrarImagen = () => {
    setModalImagen(false);
    setImagenSeleccionada(null);
    setErrorImagen("");
  };

  useEffect(() => {
    if (!imagenSeleccionada) {
      setImagenBloqueado(true);
      return;
    }

    if (imagenSeleccionada.size > 2 * 1024 * 1024) {
      setErrorImagen('La imagen seleccionada supera el límite de tamaño de 2 MB');
      setImagenBloqueado(true);
    } else {
      setErrorImagen('');
      setImagenBloqueado(false);
    }
  }, [imagenSeleccionada]);

  const handleSubirImagen = () => {
    setImagenIniciativa(imagenSeleccionada);
    setImagenPreview(URL.createObjectURL(imagenSeleccionada));
    handleCerrarImagen();
  };

  const { getRootProps: getRootPropsImagen, getInputProps: getInputPropsImagen } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImagenSeleccionada(acceptedFiles[0]);
        setFileError('');
      }
    }
  });

  // Editar titulo
  const [nuevoTitulo, setNuevoTitulo] = useState("");

  const handleTituloCambios = (event) => {
    setNuevoTitulo(event.target.value);
  };

  // Editar etiquetas
  useEffect(() => {
    const fetchData = async () => {
      const etiquetasData = await getIntereses();
      setEtiquetas(etiquetasData);
    };
    fetchData();
  }, []);

  const [etiquetas, setEtiquetas] = useState(null);
  const [etiquetasIniciativa, setEtiquetasIniciativa] = useState({});

  const seleccionaEtiqueta = (etiqueta, idEtiqueta) => {
    const nuevaEtiquetasIniciativa = {...etiquetasIniciativa};

    if (nuevaEtiquetasIniciativa.hasOwnProperty(idEtiqueta)) {
      delete nuevaEtiquetasIniciativa[idEtiqueta];
    } else {
      nuevaEtiquetasIniciativa[idEtiqueta] = etiqueta;
    }

    setEtiquetasIniciativa(nuevaEtiquetasIniciativa);
  };

  // Editar fecha final
  const datePickerCierre = useRef(null);

  const handleCambioFechaCierre = () => {
    if (datePickerCierre.current) {
      datePickerCierre.current.setOpen(true);
    }
  };

  // Editar descripción
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  const handleDescripcionCambios = (event) => {
    setNuevaDescripcion(event.target.value);
  };

  // Guardar la información editada
  const [guardarCamposBloqueado, setGuardarCamposBloqueado] = useState(false);

  useEffect(() => {
    const verificarCampos = () => {
      if (!imagenPreview || nuevoTitulo.trim() === '' || nuevaDescripcion.trim() === '' || Object.keys(etiquetasIniciativa).length === 0) {
        setGuardarCamposBloqueado(true);
      } else {
        setGuardarCamposBloqueado(false);
      }
    };

    verificarCampos();
  }, [imagenPreview, nuevoTitulo, nuevaDescripcion, Object.keys(etiquetasIniciativa)]);

  const handleGuardarCampos = async () => {
    if (guardarCamposBloqueado) {
      return
    }

    setEditingCampos(false);

    try {

    } catch (error) {

    }
  };

  const handleCancelarCampos = async () => {
    setEditingCampos(false);
  };

  return (
    <div>
      {iniciativa ? (
        <div className="i-container">
          <div className="i-iniciativa-container">
            {/* Boton para editar todo */}
            { editingCampos || esAdmin && (
              <button className="i-fa-pen" onClick={handleCamposEdit}>
                <FaPen />
              </button>
            )}

            { !editingCampos || esAdmin && (
              <>
                <button className="i-fa-pen" onClick={handleGuardarCampos} disabled={guardarCamposBloqueado}>
                  Guardar
                </button>

                <button className="i-fa-pen-2" onClick={handleCancelarCampos}>
                  Cerrar
                </button>
              </>
            )}

            {/* Foto de iniciativa */}
            {editingCampos ? (
              <div className="c-foto-iniciativa" onClick={handleMostrarImagen}>
                <img src={imagenPreview} className ="c-preview-imagen"/>
                <FaPen className="c-editar-foto"/>
              </div>
            ) : (
              <img src={iniciativa.urlImagen} className="i-foto-iniciativa"/> 
            )}
            
            <div className="i-info-container"> 
              {/* Título */}
              <div className="i-titulo">
                {editingCampos ? (
                  <div className='i-titulo-texto'>
                    <input
                      type="text"
                      className="i-edit-titulo-box"
                      value={nuevoTitulo}
                      onChange={handleTituloCambios}
                      autoFocus
                      maxLength={30}
                    />
                    <div className="i-titulo-conteo">
                      {nuevoTitulo ? `${nuevoTitulo.length}/30` : `0/30`}
                    </div>
                  </div>
                ) : (
                  iniciativa.titulo
                )}
              </div>
  
            {/* Etiquetas */}
            {editingCampos ? (
              <div className="c-etiquetas">
                {Object.values(etiquetas).map((etiqueta, idEtiqueta) => (
                  <li 
                    key={idEtiqueta} 
                    className={`c-etiqueta-item ${Object.values(etiquetasIniciativa).includes(etiqueta) ? "highlighted" : ""}`} 
                    onClick={() => seleccionaEtiqueta(etiqueta, idEtiqueta)}
                  >
                    {etiqueta}
                  </li>
                ))}
              </div>
            ) : (
              <div className="i-etiquetas">
                {Object.values(iniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                  <li 
                    key={idEtiqueta} 
                    className={`i-etiqueta-item`}
                  >
                    {etiqueta}
                  </li>
                ))}
              </div>
            )}
  
            <div className="i-datos" style={{marginLeft: '5px'}}>
              
              {/* Fecha inicio y fecha cierre */}
              <div className="i-calendarios-container">
                <div className="i-calendarios">
                  {/* Fecha inicio */}
                  <div className="i-calendario-container">
                    <div className="i-calendario">
                      <FaCalendar/>
                    </div>
                    <div className='i-fecha'>{iniciativa.fechaInicio}</div>
                  </div>
                  
                  {/* Dash */}
                  <div className="i-calendario-separador"> - </div>

                  {/* Fecha cierre */}
                  <div className="i-calendario-container">
                    {editingCampos ? (
                      <>
                        <div className="i-calendario" onClick={handleCambioFechaCierre}>
                          <FaCalendar/>
                        </div>
                        <DatePicker
                          className='react-datepicker__input-container-create'
                          selected={nuevaFechaFinal}
                          onChange={(date) => setNuevaFechaFinal(date)}
                          dateFormat="dd/MM/yyyy"
                          ref={datePickerCierre}
                          locale={es}
                          showYearDropdown
                          scrollableYearDropdown 
                          yearDropdownItemNumber={66}
                          showMonthDropdown
                          minDate={today}
                        />
                      </>
                    ) : (
                      <>
                        <div className="i-calendario">
                          <div className="i-icono-calendario">
                            <FaCalendar/>
                          </div>
                        </div>
                        <div className='i-fecha'>{iniciativa.fechaCierre}</div>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Privacidad */}
              <div className="i-dato-container">
                <div className="i-dato">
                  {iniciativa.esPublica ? <FaUnlockAlt style={{marginRight: "5px"}}/> : <FaLock style={{marginRight: "5px"}}/>}
                  {iniciativa.esPublica ? "Pública" : "Privada"}
                </div>
              </div>
  
              {/* Ubicación */}
              <div className="i-dato-container">
                <div className="i-dato">
                  <FaGlobe style={{marginRight: "5px"}}/>
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
        </div>

        <div className="c-desc">
          <div className="c-desc-texto">
            {editingCampos ? (
              <div className="c-desc-input">
                <textarea className="c-desc-input-texto"
                  value={nuevaDescripcion}
                  onChange={handleDescripcionCambios}
                  autoFocus
                  maxLength={200} />
                <div className="c-desc-conteo">
                  {nuevaDescripcion ? `${nuevaDescripcion.length}/200` : `0/200`}
                </div>
            </div>) : (
                iniciativa.descripcion
            )}
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
                              <div className="i-tarea-boton" style={{cursor: 'pointer'}} onClick={() => openUploadModal(tarea.idTarea)}><FaFolder /> Documento </div>
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
              <div className="i-btn-miembro">
                  <div className='i-btn-miembro-contenido'>
                    {infoAdmin.nombreUsuario}
                  </div>
              </div>
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
                          <div className="i-btn-miembro">
                            <div className='i-btn-miembro-contenido' style={{width: '85%'}}>
                              {miembro.nombreUsuario}
                            </div>

                            <div className='i-icon-estilos'>
                              { esAdmin && (
                                <FaTimesCircle  onClick={() => handleMostrarEliminar(miembro, miembro.idUsuario)} disabled={eliminaBloqueado} className="i-icon-times-circle" />
                              )}
                            </div>
                          </div>
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
                {!iniciativa.esPublica && esAdmin && (
                  <button type="button" className="i-btn-ver-solicitudes" onClick={handleShowModal}>
                  VER SOLICITUDES
                </button>
                )}
              
            </div>

              <Modal show={showModal} onHide={() => setShowModal(false)} centered className='e-modal'>
                <div className="modalcontainer">
                    <Modal.Header style={{ border: "none" }}> Solicitudes </Modal.Header>
                    
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

      {/* ----- Modales ----- */}

      {/* Subir imagen */}
      <Modal className="c-modal" show={modalImagen} onHide={handleCerrarImagen}>
        <Modal.Header>
          <div className="c-modal-title">Subir Imagen</div>
        </Modal.Header>
          
        <div className="c-input-body">
          <div {...getRootPropsImagen({ className: 'c-custom-file-button' })}>
            <input {...getInputPropsImagen()} />
            Subir foto
          </div>
          <span className="c-custom-file-text">
            {imagenSeleccionada ? (imagenSeleccionada.name) : "Ninguna imagen seleccionada"}
          </span>
        </div>
        {errorImagen && <span className="c-error-imagen"><FaExclamationCircle className='c-fa-ec'/>{errorImagen}</span>}

        <Modal.Footer>
          <Button onClick={handleSubirImagen} disabled={imagenBloqueado}>Guardar</Button>
          <Button onClick={handleCerrarImagen}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Subir tareas */}
      <Modal className="p-modal" show={showUploadModal} onHide={closeUploadModal}>
        <Modal.Header>
          <div className='p-modal-title'>Archivos</div>
        </Modal.Header>
        
        <div className="p-input-body">
          <div {...getRootPropsTarea({ className: 'p-custom-file-button' })}>
            <input {...getInputPropsTarea()} />
            Subir archivo
          </div>
          <span className="p-custom-file-text">{selectedFile ? selectedFile.name : "Ningun archivo seleccionado"}</span>
        </div>
        {fileError && <span className='p-error-imagen'><FaExclamationCircle className='p-fa-ec'/>{fileError}</span>}
  
        <Modal.Footer>
          <Button className='i-modal-guardar' onClick={handleUploadFile} disabled={uploadDisabled} style={{width: '115px'}}>
            {cargandoTarea ? <ClipLoader size={24} color="#fff" /> : 'Guardar'}
          </Button>
          <Button onClick={closeUploadModal} style={{width: '115px'}}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar eliminar iniciativa*/}
      <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header>
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
      
      {/* Modal miembro eliminado*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header>
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
        <Modal.Header>
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