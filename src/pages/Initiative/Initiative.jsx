import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationCircle , FaPen, FaCalendar, FaFolder, FaTimesCircle, FaGlobe, FaUnlockAlt, FaLock, FaImages, FaSearch, FaCheckCircle, FaHourglass } from 'react-icons/fa';
import { LuUpload } from 'react-icons/lu';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import es from 'date-fns/locale/es';
import { getIntereses, getIniciativa, getUsuarios, getMisTareas, getUsuario, getSolicitudes, existeSolicitud, subirImagen, actualizaSolicitud, suscribirseAIniciativa, eliminarMiembro, enviarCorreoMiembro, crearSolicitud } from '../../api/api.js';
import './Initiative.css';
import Fuse from 'fuse.js';
import Solicitud from '../../classes/Solicitud.js';

export const Initiative = () => {
  //Búsqueda de usuarios para agregar miembros
  const [showInvitarModal, setShowInvitarModal] = useState(false); 
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [invitarCargando, setInvitarCargando] = useState(false); //Implementar?
  const [usuariosDesactivados, setUsuariosDesactivados] = useState({});

 // Miembro seleccionado a eliminar
 const [miembroEliminar, setMiembroEliminar] = useState(null);

 // Modal de confirmación de eliminación
 const [modalEliminar, setModalEliminar] = useState(false);
 const handleCerrarEliminar = () => setModalEliminar(false);
 const handleMostrarEliminar = (miembro) => {
   setMiembroEliminar(miembro);
   setModalEliminar(true);
 }

 // Modal de miembro eliminado
 const [modalEliminada, setModalEliminada] = useState(false);
 const handleMostrarEliminada = () => setModalEliminada(true);
 const handleCerrarEliminada = () => setModalEliminada(false);

 // Modal de error
 const [modalError, setModalError] = useState(false);
 const handleMostrarError = () => setModalError(true);
 const handleCerrarError = () => setModalError(false);

 // Eliminar miembro
 const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

 const handleEliminaMiembro = async () => {
   setEliminaBloqueado(true);

   try {
      await eliminarMiembro(idIniciativa, miembroEliminar.idUsuario);
      await enviarCorreoMiembro(iniciativa, miembroEliminar);

      const miembrosNuevo = miembros.filter((miembro) => miembro.idUsuario !== miembroEliminar.idUsuario);
      setMiembros(miembrosNuevo);
      
      handleCerrarEliminar();
      handleMostrarEliminada();
   } catch(error) {
      handleCerrarEliminar();
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

  const [showSolicitudesModal, setShowSolicitudesModal] = useState(false); 
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState(null);
  const [usuariosRecibidos, setUsuariosRecibidos] = useState(null);
  const [usuariosEnviados, setUsuariosEnviados] = useState(null);

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
        // Obtiene información de la iniciativa
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        setImagenPreview(iniciativaData.urlImagen)
        
        // Obtiene información de fecha de cierre
        const fechaCierre = iniciativaData.fechaCierre ? parseDate(iniciativaData.fechaCierre) : null;
        setNuevaFechaFinal(fechaCierre);
      
        // Obtiene información de todos los usuarios
        const usuariosData = await getUsuarios();

        const usuariosSinMiembros = Object.values(usuariosData).filter(usuario => 
          usuario.idUsuario !== iniciativaData.idAdmin &&
          !iniciativaData.listaMiembros.includes(usuario.idUsuario) && !usuario.esAdmin
        );

        setUsuarios(usuariosSinMiembros);
        setUsuariosFiltrados(usuariosSinMiembros);
        console.log("usuarios:", usuariosSinMiembros);

        // Obtiene información del admin de la iniciativa
        setInfoAdmin(usuariosData[iniciativaData.idAdmin]);

        // Obtiene información del usuario actual
        setEsAdmin(usuariosData[user].idUsuario === iniciativaData.idAdmin)
        
        // Obtiene información de los miembros de la iniciativa
        const miembrosData = Object.values(usuariosData).filter(usuario =>
          usuario.idUsuario !== iniciativaData.idAdmin &&
          iniciativaData.listaMiembros.includes(usuario.idUsuario) && !usuario.esAdmin
        );

        setMiembros(miembrosData);
        
        // Obtiene información de solicitudes
        const solicitudes = await getSolicitudes("Iniciativas", idIniciativa);

        let solicitudesRecibidasData = []
        for (const solicitud of solicitudes) {
          if (solicitud.tipoInvitacion == "UsuarioAIniciativa" && solicitud.estado == "Pendiente") {
            solicitudesRecibidasData.push(solicitud);
          }
        }
        setSolicitudesRecibidas(solicitudesRecibidasData);

        let solicitudesEnviadasData = []
        for (const solicitud of solicitudes) {
          if (solicitud.tipoInvitacion == "IniciativaAUsuario") {
            solicitudesEnviadasData.push(solicitud);
          }
        }
        setSolicitudesEnviadas(solicitudesRecibidasData);

        let usuariosRecibidosData = []
        for (const solicitud of solicitudesRecibidasData){
          const usuarioRecibido = await getUsuario(solicitud.idUsuario);
          usuariosRecibidosData.push(usuarioRecibido);
        }
        setUsuariosRecibidos(usuariosRecibidosData);

        let usuariosEnviadosData = []
        for (const solicitud of solicitudesEnviadasData){
          const usuarioEnviado = await getUsuario(solicitud.idUsuario);
          usuariosEnviadosData.push(usuarioEnviado);
        }
        setUsuariosEnviados(usuariosEnviadosData);

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
      console.log("Error al enviar solicitud al usuario");
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

  const textareaRef = useRef(null);

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editingCampos) {
      autoResizeTextarea();

      if (editingCampos && textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
        textareaRef.current.focus();
      }
    }
  }, [editingCampos, nuevaDescripcion]);

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

  // Paginas modal mis solicitudes
  const [paginaActual, setPaginaActual] = useState('solicitudes');

  return (
    <div>
      {iniciativa && tareas && miembros ? (
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
                  <div className="i-titulo-normal">
                    {iniciativa.titulo}
                  </div>
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
          {editingCampos ? (
            <div className='c-container-conteo'>
              <div className="c-desc-conteo" style={{top: "-30px"}}>
                {nuevaDescripcion ? `${nuevaDescripcion.length}/200` : `0/200`}
              </div>

              <div className="c-desc-texto" style={{paddingTop: '10px', padding: '15px'}}>
                <style jsx>{`
                  textarea {
                    border-radius: 25px;
                    position: relative;
                    width: 100%;
                    height: 25px;
                    font-size: 20px;
                    resize: none;
                    outline: none;
                  }
                `}
                </style>

                <textarea
                  ref={textareaRef}
                  className="c-desc-input-texto"
                  value={nuevaDescripcion}
                  onChange={handleDescripcionCambios}
                  autoFocus
                  maxLength={200} 
                  style={{ borderColor: nuevaDescripcion ? 'transparent' : 'transparent' }}
                />
              </div>
            </div>
          ) : (
            <div className="c-desc-texto" style={{paddingBottom: '10.5px', paddingLeft: '2px'}}>
               <div style={{padding: '15px', marginTop: '2px'}}> 
                  {iniciativa.descripcion}
                </div>
            </div>
          )}
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
                          <div className="i-btn-miembro">
                            <div className='i-btn-miembro-contenido' style={esAdmin? {width: '85%'} : {width: '100%'}}>
                              {miembro.nombreUsuario}
                            </div>

                            <div className='i-icon-estilos'>
                              {esAdmin && (
                                <FaTimesCircle  onClick={() => handleMostrarEliminar(miembro)} className="i-icon-times-circle" />
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

      {/* ----- Modales ----- */}

      {/* ----- Ver solicitudes ----- */}
      <Modal show={showSolicitudesModal} onHide={() => setShowSolicitudesModal(false)} centered className='e-modal'>
        <div className="modalcontainer">
          <Modal.Header closeButton style={{ border: "none" }}> </Modal.Header>

          {/* Determinar en que página esta */}
          <div className="modal-nav">
            <button 
              className={paginaActual === 'solicitudes' ? 'active' : ''} 
              onClick={() => setPaginaActual('solicitudes')}
            >
              Solicitudes recibidas
            </button>
            <button 
              className={paginaActual === 'miembros' ? 'active' : ''} 
              onClick={() => setPaginaActual('miembros')}
            >
              Solicitudes enviadas
            </button>
          </div>

          {/* Contenido */}
          <div className="modal-content">
            {/* Solicitudes */}
            {paginaActual === 'solicitudes' ? (
              !usuariosRecibidos || usuariosRecibidos.length === 0 ? (
                <div className="m-error">
                  {/* Ninguna solicitud */}
                  Esta iniciativa no ha recibido solicitudes.
                </div>
              ) : (
                <div className="m-iniciativas-container">
                  {/* Lista de solicitudes */}
                  {usuariosRecibidos.map((usuario, index) => (
                    <div key={index} className='e-iniciativa'>
                      {/* Usuario */}
                      <div className="e-desc">{usuario.nombreUsuario}</div>

                      {/* Imagen */}
                      <div className='e-iniciativa-imagen'>
                        <img src={usuario.urlImagen} alt={usuario.nombreUsuario} />
                      </div>

                      {/* Info extra */}
                      <div className='e-iniciativa-texto'>
                        {/* Nombre */}
                        <div className="e-titulo">{usuario.nombre}</div>
                        
                        {/* Etiquetas */}
                        <div className="i-etiquetas">
                          {Object.values(usuario.listaHabilidades).map((habilidad, idHabilidad) => (
                            <li key={idHabilidad} className={`i-etiqueta-item`}>
                              {habilidad}
                            </li>
                          ))}
                        </div>

                        {/* Aceptar / rechazar */}
                        <div>
                          <button onClick={() => handleAceptarSolicitud(index)}>Aceptar</button>
                          <button onClick={() => handleRechazarSolicitud(index)}>Rechazar</button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="m-iniciativas-container">
                {/* Contenido de miembros */}                
                <div>
                {usuariosEnviados.map((usuario, index) => (
                  <div key={index} className='rq-iniciativa'>
                    {/* Imagen y título */}
                    <div className='rq-iniciativa-imagen'>
                        <img src={usuario.urlImagen} alt = {usuario.nombreUsuario} />
                    </div>

                    <div className='rq-iniciativa-texto'>
                      <div className="rq-titulo">{usuario.nombreUsuario}</div>
                      
                      {/* Estado */}
                      <div className='rq-estado'>
                        <div>
                          {solicitudesEnviadas[index].estado}
                          {solicitudesEnviadas[index].estado === 'Aceptada' && <FaCheckCircle className='fa-1'/>}
                          {solicitudesEnviadas[index].estado === 'Rechazada' && <FaTimesCircle className='fa-2'/>}
                          {solicitudesEnviadas[index].estado === 'Pendiente' && <FaHourglass className='fa-3'/>}
                        </div>
                      </div>
                    </div>
                  </div>    
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Subir imagen */}
      <Modal className="c-modal" show={modalImagen} onHide={handleCerrarImagen}>
        <Modal.Header>
          <div className="c-modal-title">Subir Imagen</div>
        </Modal.Header>
          
        <div className="c-input-body">
          <div {...getRootPropsImagen({ className: "c-drag-drop" })}>
            <input {...getInputPropsImagen()} />
            <FaImages className="c-drag-drop-image"/>
            {imagenSeleccionada ? (
              <div className="c-drag-drop-text">
                {imagenSeleccionada.name}
              </div>
            ) : (
              <div className="c-drag-drop-text" style={{width: "150px"}}>
                <span style={{fontWeight: "600"}}>Selecciona</span> o arrastra una imagen
              </div>
            )}
          </div>
        </div>
        {errorImagen && <span className="c-error-imagen"><FaExclamationCircle className='c-fa-ec'/>{errorImagen}</span>}

        <Modal.Footer>
          <Button onClick={handleSubirImagen} disabled={imagenBloqueado}>Guardar</Button>
          <Button onClick={handleCerrarImagen}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Subir tareas */}
      <Modal className="c-modal" show={showUploadModal} onHide={closeUploadModal}>
        <Modal.Header>
          <div className="c-modal-title">Subir Archivo</div>
        </Modal.Header>
        
        <div className="c-input-body">
          <div {...getRootPropsTarea({ className: "c-drag-drop" })}>
            <input {...getInputPropsTarea()} />
            <LuUpload className="c-drag-drop-image"/>
            {selectedFile ? (
              <div className="c-drag-drop-text">
                {selectedFile.name}
              </div>
            ) : (
              <div className="c-drag-drop-text" style={{width: "150px"}}>
                <span style={{fontWeight: "600"}}>Selecciona</span> o arrastra un archivo
              </div>
            )}
          </div>
        </div>
        {fileError && <span className='p-error-imagen'><FaExclamationCircle className='p-fa-ec'/>{fileError}</span>}
  
        <Modal.Footer>
          <Button className='i-modal-guardar' onClick={handleUploadFile} disabled={uploadDisabled} style={{width: '115px'}}>
            {cargandoTarea ? <ClipLoader size={24} color="#fff" /> : 'Guardar'}
          </Button>
          <Button onClick={closeUploadModal} style={{width: '115px'}}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar eliminar miembro*/}
      <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          {miembroEliminar && (
            <div className="ea-modal-body">
              ¿Estás seguro que quieres eliminar a <span style={{fontWeight:'bold'}}>{miembroEliminar.nombreUsuario}</span>?
            </div>
          )}
        <Modal.Footer>
          <Button className="eliminar" onClick={handleEliminaMiembro} disabled={eliminaBloqueado} style={{width: "127px"}}>
            {eliminaBloqueado ? <ClipLoader size={20} color="#fff" /> : 'Eliminar'}
          </Button>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal miembro eliminado*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          {miembroEliminar && (
            <div className="ea-modal-body">
              Miembro <span style={{fontWeight:'bold'}}>{miembroEliminar.nombreUsuario}</span> eliminado exitosamente
            </div>
          )}
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal error eliminar*/}
      <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
        <Modal.Header>
        <div className="ea-modal-title">Error</div>
        </Modal.Header>
          {miembroEliminar && (
            <div className="ea-modal-body">
              Error al eliminar miembro <span style={{fontWeight:'bold'}}>{miembroEliminar.nombreUsuario}</span>
            </div>
          )}
        <Modal.Footer>
          <Button onClick={handleCerrarError}>Cerrar</Button>
        </Modal.Footer>
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