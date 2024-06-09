import React, { useState, useEffect, useRef } from 'react';
import { FaUserPlus, FaExclamationCircle , FaPen, FaCalendar, FaFolder, FaTimesCircle, FaGlobe, FaUnlockAlt, FaLock, FaImages, FaSearch, FaCheckCircle, FaHourglass, FaTrash, FaUser, FaEnvelope } from 'react-icons/fa';
import { IoMdAddCircleOutline } from "react-icons/io";
import { LuUpload } from 'react-icons/lu';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import es from 'date-fns/locale/es';
import { getIntereses, getIniciativa, actualizaIniciativa, getUsuarios, getMisTareas, getUsuario, getSolicitudes, subirImagen, crearSolicitud, existeSolicitud, actualizaSolicitud, suscribirseAIniciativa, eliminarMiembro, enviarCorreoMiembro, eliminarSolicitud, actualizaTarea } from '../../api/api.js';
import Solicitud from '../../classes/Solicitud.js'
import Fuse from 'fuse.js';
import './Initiative.css';
import Tarea from '../../classes/Tarea.js';

export const Initiative = () => {
  const { idIniciativa } = useParams();

  // Información de la iniciativa
  const [iniciativa, setIniciativa] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // Información de fecha de cierre
  const [nuevaFechaFinal, setNuevaFechaFinal] = useState(null);
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Información de todos los usuarios
  const { user } = useAuth();
  const [infoAdmin, setInfoAdmin] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [usuariosTodos, setUsuariosTodos] = useState({});
  const [miembros, setMiembros] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [usuariosFiltrados, setUsuariosFiltrados] = useState({});
  const [totalMiembros, setTotalMiembros] = useState(false);
  const [usuariosTotal, setUsuariosTotales] = useState(false);

  // Información de solicitudes
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState(null);
  const [usuariosRecibidos, setUsuariosRecibidos] = useState(null);
  const [usuariosEnviados, setUsuariosEnviados] = useState([]);
  const [showSolicitudesModal, setShowSolicitudesModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState('solicitudes');

  // Información de tareas
  const [tareas, setTareas] = useState(null);
  const datePickersTareas = useRef([]);
  const [tareasCompletadas, setTareasCompletadas] = useState(null);

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
        setUsuariosTodos(usuariosData);

        // Obtiene información del admin de la iniciativa
        const adminIniciativa = usuariosData[iniciativaData.idAdmin];
        const usuarioEsAdmin = usuariosData[user].idUsuario === iniciativaData.idAdmin;
        setInfoAdmin(adminIniciativa);
        setEsAdmin(usuarioEsAdmin);

        // Obtiene información de los miembros de la iniciativa
        let usuariosMiembros = [...Object.values(usuariosData)];

        usuariosMiembros = usuariosMiembros.filter((usuario) =>
          iniciativaData.listaMiembros.includes(usuario.idUsuario) &&
          usuario.idUsuario != adminIniciativa.idUsuario && !usuario.esAdmin);

        setMiembros(usuariosMiembros);
        setUsuariosTotales(usuariosMiembros);
        setTotalMiembros(usuariosMiembros);
        
        if (usuarioEsAdmin) {
          // Solo usar la página de enviadas si la iniciativa es pública
          if (iniciativaData.esPublica) {
            const nuevaPagina = 'miembros';
            setPaginaActual(nuevaPagina);
          }

          // Obtiene información de solicitudes
          const solicitudes = await getSolicitudes("Iniciativas", idIniciativa);
          
          let solicitudesRecibidasData = []
          let solicitudesEnviadasData = []
          for (const solicitud of solicitudes) {
            if (solicitud.tipoInvitacion == "UsuarioAIniciativa" && solicitud.estado == "Pendiente") {
              solicitudesRecibidasData.push(solicitud);
            } else if (solicitud.tipoInvitacion == "IniciativaAUsuario") {
              solicitudesEnviadasData.push(solicitud);
            }
          }
          setSolicitudesRecibidas(solicitudesRecibidasData);
          setSolicitudesEnviadas(solicitudesEnviadasData);

          // Obtiene información de usuarios asociados a solicitudes
          let usuariosRecibidosData = [];
          for (const solicitud of solicitudesRecibidasData) {
            const usuarioRecibido = await getUsuario(solicitud.idUsuario);
            const recibido = { ...usuarioRecibido, aceptarDesactivado: false, rechazarDesactivado: false};
            usuariosRecibidosData.push(recibido);
          }

          let usuariosEnviadosData = []
          for (const solicitud of solicitudesEnviadasData) {
            const usuarioEnviado = await getUsuario(solicitud.idUsuario);
            usuariosEnviadosData.push(usuarioEnviado);
          }

          // Obtiene información de los usuarios sin miembros ni solicitudes
          let usuariosSinMiembros = {...usuarios};

          for (const usuario of Object.values(usuariosData)) {
            // No es miembro ni admin ni tiene solicitudes recibidass
            if (!iniciativaData.listaMiembros.includes(usuario.idUsuario)
              && !solicitudesRecibidasData.map((recibido) => recibido.idUsuario).includes(usuario.idUsuario)
              && usuario.idUsuario != adminIniciativa.idUsuario && !usuario.esAdmin) {
              // Si ya se envió una solicitud al usuario
              const solicitudEnviada = solicitudesEnviadasData.find((enviado) => enviado.idUsuario === usuario.idUsuario);
              if (solicitudEnviada) {
                // Si la solicitud está pendiente, se puede cancelar la invitación
                if (solicitudEnviada.estado == "Pendiente") {
                  usuariosSinMiembros[usuario.idUsuario] = {...usuario, invitarCargando: false, invitarDesactivado: true, cancelarDesactivado: false};
                }
              }
              // Si no se ha enviado, se puede invitar al usuario
              else {
                usuariosSinMiembros[usuario.idUsuario] = {...usuario, invitarCargando: false, invitarDesactivado: false, cancelarDesactivado: true};
              }
            }
          }

          setUsuarios(usuariosSinMiembros);
          setUsuariosFiltrados(usuariosSinMiembros);
          setUsuariosRecibidos(usuariosRecibidosData);
          setUsuariosEnviados(usuariosEnviadosData);
        }

        // Obtiene información de las tareas
        const tareaPromises = iniciativaData.listaTareas.map(async (idTarea) => {
          const tareaData = await getMisTareas(idTarea);
          return tareaData;
        });
        const tareas = await Promise.all(tareaPromises);

        setTareas(tareas.filter((tarea) => !tarea.completada));
        setTareasCompletadas(tareas.filter((tarea) => tarea.completada));
      } catch (error) {
        console.error("Error obteniendo información de la iniciativa:", error.message);
      }
    };
    fetchData();
  }, [idIniciativa]);

  // Barra de progreso
  const ProgressBar = ({ progress }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-label">{`${progress}%`}</div>
      </div>
    );
  };

  // Búsqueda de usuarios para agregar miembros
  const [showInvitarModal, setShowInvitarModal] = useState(false); 
  const [filtro, setFiltro] = useState('');

  const buscarUsuario = (event) => {
    const busqueda = event.target.value;
    setFiltro(busqueda);

    // Si el término de búsqueda está vacío, mostrar todos los usuarios
    if (!busqueda) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    // Claves de búsqueda
    const fuse = new Fuse(Object.values(usuarios), {
      keys: ['nombreUsuario', 'nombre'],
      includeScore: true,
      threshold: 0.4,
    });

    const resultado = fuse.search(busqueda);
    const filtradas = {};
    resultado.forEach((item) => {
      filtradas[item.item.idUsuario] = item.item;
    });

    setUsuariosFiltrados(filtradas);
  };
  

  const [filtroAsignar, setFiltroAsignar] = useState('');
  const buscarUsuarioAsignar = (event) => {
    const busqueda = event.target.value;
    setFiltroAsignar(busqueda);

    // Si el término de búsqueda está vacío, mostrar todos los usuarios
    if (!busqueda) {
      setTotalMiembros(usuariosTotal);
      return;
    }

    // Claves de búsqueda
    const fuse2 = new Fuse(Object.values(miembros), {
      keys: ['nombreUsuario', 'nombre'],
      includeScore: true,
      threshold: 0.4,
    });

    const resultado = fuse2.search(busqueda);
    const filtradas = {};
    resultado.forEach((item) => {
      filtradas[item.item.idUsuario] = item.item;
    });

    setTotalMiembros(filtradas);
  };


  // Invitar usuarios
  const handleInvitarUsuario = async (idUsuario) => {
    let usuariosNuevo = {...usuariosFiltrados};
    usuariosNuevo[idUsuario].invitarDesactivado = true;
    usuariosNuevo[idUsuario].invitarCargando = true;
    setUsuariosFiltrados(usuariosNuevo);
    
    try {
      // Crear solicitud
      const solicitud = new Solicitud(idUsuario, idIniciativa, "Pendiente", "IniciativaAUsuario");
      await crearSolicitud(solicitud);

      // Actualizar lista de solicitudes enviadas
      let solicitudesEnviadasNuevo = [...solicitudesEnviadas];
      solicitudesEnviadasNuevo.push(solicitud);
      setSolicitudesEnviadas(solicitudesEnviadasNuevo);

      let usuariosEnviadosNuevo = [...usuariosEnviados];
      usuariosEnviadosNuevo.push(usuariosFiltrados[idUsuario]);
      setUsuariosEnviados(usuariosEnviadosNuevo);
    } catch (error) {
      console.error("Error al enviar solicitud al usuario");
    } finally {
      usuariosNuevo = {...usuariosFiltrados};
      usuariosNuevo[idUsuario].invitarCargando = false;
      usuariosNuevo[idUsuario].cancelarDesactivado = false;
      setUsuariosFiltrados(usuariosNuevo);
    }
  };

  
  // Cancelar invitación
  const [faTrashBloqueado, setFaTrashBloqueado] = useState(false);

  const handleCancelarUsuario = async (index, idUsuario) => {
    setFaTrashBloqueado(prevState => ({ ...prevState, [index]: true }));

    let usuariosNuevo = {...usuariosFiltrados};

    // Cancelar desde modal invitar miembros
    if (usuariosNuevo[idUsuario]) {
      usuariosNuevo[idUsuario].cancelarDesactivado = true;
      usuariosNuevo[idUsuario].invitarCargando = true;
      setUsuariosFiltrados(usuariosNuevo);
    }

    let solicitudesEnviadasNuevo = [...solicitudesEnviadas];
    let usuariosEnviadosNuevo = [...usuariosEnviados];
    
    try {
      // Actualizar lista de solicitudes enviadas
      solicitudesEnviadasNuevo = solicitudesEnviadasNuevo.filter((enviada) => enviada.idUsuario !== idUsuario);
      usuariosEnviadosNuevo = usuariosEnviadosNuevo.filter((enviado) => enviado.idUsuario !== idUsuario);

      // Eliminar solicitud
      const solicitud = await existeSolicitud(idUsuario, idIniciativa);
      await eliminarSolicitud(solicitud);
    } catch (error) {
      console.error("Error al cancelar la solicitud");
    } finally {
      setFaTrashBloqueado(prevState => ({ ...prevState, [index]: false }));
      setSolicitudesEnviadas(solicitudesEnviadasNuevo);
      setUsuariosEnviados(usuariosEnviadosNuevo);

      usuariosNuevo = {...usuariosFiltrados};

      if (usuariosNuevo[idUsuario]) {
        usuariosNuevo[idUsuario].invitarCargando = false;
        usuariosNuevo[idUsuario].invitarDesactivado = false;
      } else {
        // Eliminar solicitud desde el modal de solicitudes
        const usuario = usuariosEnviados.find((enviado) => enviado.idUsuario == idUsuario);
        usuariosNuevo[idUsuario] = {...usuario, invitarDesactivado: false, cancelarDesactivado: true};
      }
      setUsuariosFiltrados(usuariosNuevo);
    }
  }


  // Aceptar solicitudes de usuario
  const [aceptarSolicitudD, setAceptarSolicitudD] = useState(false);

  const handleAceptarSolicitud = async (index, usuario) => {
    setAceptarSolicitudD(prevState => ({ ...prevState, [index]: true }));

    let usuariosRecibidosNuevo = [...usuariosRecibidos];
    let solicitudesRecibidasNuevo = [...solicitudesRecibidas];

    try {
      // Actualizar lista de solicitudes recibidas
      solicitudesRecibidasNuevo[index].estado = "Aceptada";
      usuariosRecibidosNuevo = usuariosRecibidosNuevo.filter((recibido) => recibido.idUsuario !== usuario.idUsuario);
      
      // Actualizar estado de solicitud
      const solicitud = solicitudesRecibidasNuevo[index];
      await actualizaSolicitud(solicitud);

      // Actualizar listaIniciativasMiembro del usuario que hizo la solicitud
      await suscribirseAIniciativa(usuario.idUsuario, idIniciativa);

      // Actualizar lista de miembros
      setMiembros([...miembros, usuario]);
      setTotalMiembros([...miembros, usuario]);
    } catch (error) {
      console.error("Error al aceptar la solicitud");
    } finally {
      setAceptarSolicitudD(prevState => ({ ...prevState, [index]: false }));
      setSolicitudesRecibidas(solicitudesRecibidasNuevo);
      setUsuariosRecibidos(usuariosRecibidosNuevo);
    }
  };


  // Rechazar solicitudes de usuario
  const [rechazarSolicitudD, setRechazarSolicitudD] = useState(false);
  
  const handleRechazarSolicitud = async (index, usuario) => {
    setRechazarSolicitudD(prevState => ({ ...prevState, [index]: true }))

    let usuariosRecibidosNuevo = [...usuariosRecibidos];
    let solicitudesRecibidasNuevo = [...solicitudesRecibidas];

    try {
      // Actualizar lista de solicitudes recibidas
      solicitudesRecibidasNuevo[index].estado = "Rechazada";
      usuariosRecibidosNuevo = usuariosRecibidosNuevo.filter((recibido) => recibido.idUsuario !== usuario.idUsuario);
      
      // Actualizar estado de solicitud
      const solicitud = solicitudesRecibidasNuevo[index];
      await actualizaSolicitud(solicitud);
    } catch (error) {
      console.error("Error al rechazar la solicitud");
    } finally {
      setRechazarSolicitudD(prevState => ({ ...prevState, [index]: false }));
      setSolicitudesRecibidas(solicitudesRecibidasNuevo);
      setUsuariosRecibidos(usuariosRecibidosNuevo);
    }
  };
  
  // Ver perfil del miembro
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [modalMiembro, setModalMiembro] = useState(false);

  const handleMostrarMiembro = (miembro) => {
    setMiembroSeleccionado(miembro);
    setModalMiembro(true);
  };

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

      // Eliminar de la lista de miembros
      const miembrosNuevo = miembros.filter((miembro) => miembro.idUsuario !== miembroEliminar.idUsuario);
      setMiembros(miembrosNuevo);
      const totalMiembrosNuevo = totalMiembros.filter((miembro) => miembro.idUsuario !== miembroEliminar.idUsuario);
      setTotalMiembros(totalMiembrosNuevo);

      // Regresar a la lista de usuarios
      const usuariosNuevo = {...usuarios};
      usuariosNuevo[miembroEliminar.idUsuario] = {...miembroEliminar, invitarCargando: false, invitarDesactivado: false, cancelarDesactivado: true};
      setUsuarios(usuariosNuevo);
      setUsuariosFiltrados(usuariosNuevo);

      // Actualizar tareas sin miembro
      let tareasNuevo = [...tareas];
      for (const tarea of tareasNuevo) {
        if (tarea.idAsignado === miembroEliminar.idUsuario) {
          tarea.idAsignado = null;
        }
      }
      setTareas(tareasNuevo);
      
      handleCerrarEliminar();
      handleMostrarEliminada();
    } catch(error) {
      handleCerrarEliminar();
      handleMostrarError();
    } finally {
      setEliminaBloqueado(false);
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
    //tarea

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
    setModalEntregable(false);
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
      textarea.style.height = 'auto';
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
  const [guardarCargando, setGuardarCargando] = useState(false);

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
    setGuardarCargando(true);
    let nuevaIniciativa = {...iniciativa};

    try {
      // Actualiza información de la iniciativa
      nuevaIniciativa = {
        ...nuevaIniciativa,
        titulo: nuevoTitulo,
        descripcion: nuevaDescripcion,
        listaEtiquetas: etiquetasIniciativa,
        fechaCierre: formatDate(nuevaFechaFinal)
      };

      setNuevoTitulo(nuevoTitulo);
      setNuevaDescripcion(nuevaDescripcion);
      setEtiquetasIniciativa(etiquetasIniciativa);
      setNuevaFechaFinal(nuevaFechaFinal);
      setIniciativa(nuevaIniciativa);
      
      await actualizaIniciativa(nuevaIniciativa);

      // Actualiza tareas de la iniciativa
      const tareasPromises = tareas.map(async (tarea) => {
        if (!miembros.some(miembro => miembro.idUsuario === tarea.idAsignado)) {
          tarea.idAsignado = null;
        }
        await actualizaTarea(tarea);
      });
      await Promise.all(tareasPromises);
    } catch (error) {
      console.log(error);
    } finally {
      setGuardarCargando(false);
      setEditingCampos(false);
    }
  };



  // TAREAS //
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadDisabled, setUploadDisabled] = useState(true);
  const [cargandoTarea, setCargandoTarea] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tareaUpload, setTareaUpload] = useState(new Tarea());
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const [selectedEntregable, setTareaEntregable] = useState(null);
  const [modalEntregable, setModalEntregable] = useState(false);

  const openUploadModal = (tarea, index) => {
    console.log('ID ONE UPLOAD', tarea.idTarea);
    setShowUploadModal(true);
    setFileError('');
    setTareaUpload(tarea);
    setSelectedTaskIndex(index);

    setSelectedTaskId(tarea.idTarea);
  };

  const openAsignarTarea = (tarea, index) => {
    console.log('ID ONE Tarea', tarea.idTarea);
    setShowAsignarModal(true);
    setTareaUpload(tarea);
    setSelectedTaskIndex(index);
    setSelectedTaskId(tarea.idTarea);
  };

  const handleMostrarEntregable = (tareaUrl) => {
    setModalEntregable(true);
    setTareaEntregable(tareaUrl);
  };



  const closeUploadModal = () => {
    setCargandoTarea(false);
    setShowUploadModal(false);
    setSelectedFile(null);
    setSelectedTaskId(null);
    setShowAsignarModal(false);
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

      if (cargandoTarea) {
        setUploadDisabled(true);
      }
    }
  }, [selectedFile, cargandoTarea]);

  const handleUploadFile = async (tarea, index) => {
    console.log('TAREA ID', tareaUpload.idTarea);
    console.log('TAREA INDEX', selectedTaskIndex);
    setUploadDisabled(true);
    setCargandoTarea(true);

    try {
      const fileUrl = await subirImagen(selectedFile, `Tareas/${selectedTaskId}`);
      console.log(fileUrl);

      const tareaNueva = { ...tareaUpload, urlEntrega: fileUrl, completada: true}
      await actualizaTarea(tareaNueva);

      const updatedTareas = tareas.filter((tarea, i) => i !== selectedTaskIndex);
      const updatedTareasCompletadas = [...tareasCompletadas, tareaNueva];

      setTareas(updatedTareas);
      setTareasCompletadas(updatedTareasCompletadas);
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
    } finally {
      setCargandoTarea(false);
      closeUploadModal();
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

  const tareaFechaLimite = (fechaEntrega) => {
    const fechaActual = new Date();
    const fecha = new Date(fechaEntrega);
    fecha.setHours(23, 59, 59, 999);

    return fecha < fechaActual;
  };


  // Tareas height
  // Titulo
  const textareaRefs3 = useRef([null]);

  const autoResizeTextarea3 = (index) => {
    const textarea = textareaRefs3.current[index];
    if (textarea) {
      textarea.style.height = '';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    textareaRefs3.current.forEach((textarea, index) => {
      if (textarea) {
        autoResizeTextarea3(index);
      }
    });
  }, [tareas]);

  // Descripción
  const textareaRefs2 = useRef([null]);

  const autoResizeTextarea2 = (index) => {
    const textarea = textareaRefs2.current[index];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };


  return (
    <div>
      {iniciativa && tareas && miembros ? (
        <div className="i-container">
          <div className="i-iniciativa-container">
            {/* Boton para editar todo */}
            {editingCampos || esAdmin && (
              <button className="i-fa-pen" onClick={handleCamposEdit}>
                <FaPen />
              </button>
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

          <ProgressBar progress={Math.round((tareasCompletadas.length / (tareas.length + tareasCompletadas.length)) * 100)} />
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
                  style={{ borderColor: 'transparent', height: '25px' }}
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
              {/* Tarea asignada a mí */}
              <div className="i-titulo-tareas">{esAdmin ? 'Tareas' : 'Mis Tareas'}</div>
              
              {(tareas && tareas.length > 0 && esAdmin) ? (
                
                <div className='i-tareas-container'>
                  {/* Lista de TOTAL de Tareas Asignadas */}
                  {tareas.filter(tarea => !tarea.completada).length === 0 ? (
                    <div className="m-error">
                    No hay tareas asignadas.
                    </div>
                  ) : (
                    <div>
                      {/* VISTA TAREAS DE ADMIN EDITANDO */}
                      {editingCampos ? (
                        <div>
                          {tareas.map((tarea, index) => (
                            <div className="i-tarea-container-2" key={tarea.idTarea}>
                              <div className="i-row-tarea">
                                <div className="i-tarea">
                                  <div className="i-tarea-info">
                                    
                                    {/* Tarea titulo */}
                                    <div className="i-tarea-titulo">
                                      <div className="i-tarea-texto">
                                        <input
                                          type="text"
                                          className="i-edit-tarea-box"
                                          value={tareas[index].titulo}
                                          onChange={(e) => {tareas[index].titulo = e.target.value; setTareas([...tareas]);}}
                                          autoFocus
                                          maxLength={30}
                                        />
                                      </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className='c-container-conteo'>
                                      <div className="c-tarea-texto" style={{paddingTop: '2px'}}>
                                        <style jsx>{`
                                          textarea {
                                            border-radius: 25px;
                                            position: relative;
                                            width: 100%;
                                            height: 25px;
                                            font-size: 16px;
                                            resize: none;
                                            outline: none;
                                          }
                                        `}
                                        </style>
                                        <textarea
                                          ref={el => textareaRefs2.current[index] = el}
                                          className="c-desc-input-texto-2"
                                          value={tareas[index].descripcion}
                                          onChange={(e) => {
                                            tareas[index].descripcion = e.target.value;
                                            setTareas([...tareas]);
                                            autoResizeTextarea2(index);
                                          }}
                                          maxLength={200}
                                          style={{ borderColor: 'transparent' }}
                                        />
                                      </div>

                                      <button className="c-btn-editar-flex" style={{marginRight: '20px'}}>
                                        {tarea.descripcion ? `${tarea.descripcion.length}/200` : `0/200`}
                                      </button>
                                    </div>

                                  </div>

                                  {/* Botones tareas */}
                                  <div className="i-tarea-botones">
                                    {/* Fecha */}
                                    <>
                                      <div className="i-tarea-boton" style={tareaFechaLimite(tarea.fechaEntrega) ? {backgroundColor: "#f09e9e"} : {}}>
                                        <FaCalendar/> Fecha
                                        <DatePicker
                                          className='react-datepicker-2'
                                          selected={tareas[index].fechaEntrega}
                                          onChange={(date) => {tareas[index].fechaEntrega = date; setTareas([...tareas]);}}
                                          dateFormat="dd/MM/yyyy"
                                          ref={(el) => (datePickersTareas.current[index] = el)}
                                          locale={es}
                                          showYearDropdown
                                          scrollableYearDropdown 
                                          yearDropdownItemNumber={66}
                                          showMonthDropdown
                                          minDate={today}
                                        />
                                      </div>
                                    </>
                                    
                                    {/* Asignar */}
                                    <div className="i-tarea-boton" style={{ marginTop: '5px', cursor: 'pointer' }} onClick={() => openAsignarTarea(tarea, index)}>
                                      {tarea.idAsignado && usuariosTodos ? (
                                        <>{usuariosTodos[tarea.idAsignado].nombreUsuario}</>
                                      ) : (
                                        <><FaUserPlus /> Asignar</>
                                      )}
                                    </div>
                                    
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}  
                        </div>

                      ) : (

                      /* VISTA TAREAS TOTALES ADMIN */
                      <div>
                        {tareas.map((tarea, index) => (
                          <div className="i-tareas-container-2" key={tarea.idTarea}>
                            <div className="i-tarea">
                              <div className="i-tarea-info">
                                <div className="c-titulo-texto-tarea" style={{maxWidth: '400px', whiteSpace: 'nowrap'}}>{tarea.titulo}</div>
                                <div className="i-tarea-desc">
                                  <div className="i-tarea-texto" style={{paddingTop: '2px'}}>
                                    {tarea.descripcion}
                                  </div>
                                </div>
                              </div>
                              <div className="i-tarea-botones">
                                {/* Asignar */}
                                <div className="i-tarea-boton" style={tareaFechaLimite(tarea.fechaEntrega) ? {backgroundColor: "#f09e9e"} : {}}>
                                  <FaCalendar /> Fecha {formatDate(tarea.fechaEntrega)}
                                </div>
                                <div className="i-tarea-boton" style={{ marginTop: '5px' }}>
                                  {tarea.idAsignado && usuariosTodos ? (
                                    <>{usuariosTodos[tarea.idAsignado].nombreUsuario}</>
                                  ) : (
                                    <><FaUserPlus /> Sin Asignar</>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}

                    </div>
                  )}
       
                </div>
                

              ) : (

                <div className='i-tareas-container'>
                  
                  {/* VISTA TAREAS ASIGNADAS A MI */}
                  {tareas.filter(tarea => tarea.idAsignado === user).length > 0 ? (  
                    <div>
                    {tareas.filter(tarea => tarea.idAsignado === user).map((tarea, index) => (
                      <div className="i-tareas-container-2" key={tarea.idTarea}>
                        <div className="i-tarea">

                          <div className="i-tarea-info">
                            <div className="c-titulo-texto-tarea" style={{maxWidth: '400px', whiteSpace: 'nowrap'}}>{tarea.titulo}</div>
                            <div className="i-tarea-desc">
                              <div className="i-tarea-texto" style={{paddingTop: '2px'}}>
                                {tarea.descripcion}
                              </div>
                            </div>
                          </div>
                          <div className="i-tarea-botones">
                            <div className="i-tarea-boton" style={tareaFechaLimite(tarea.fechaEntrega) ? {backgroundColor: "#f09e9e"} : {}}>
                              <FaCalendar /> Fecha {formatDate(tarea.fechaEntrega)}
                            </div>

                            {/* Entregar tarea se desactiva si se pasa la fecha de entrega */}
                            <button className="i-tarea-boton"
                              style={tareaFechaLimite(tarea.fechaEntrega) ? {marginTop: '5px', cursor: 'default'} : {marginTop: '5px'}}
                              disabled={tareaFechaLimite(tarea.fechaEntrega)}
                              onClick={() => openUploadModal(tarea, index)}>
                                <LuUpload /> Entregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>

                  ) : (

                    <div className="m-error">
                    No hay tareas asignadas.
                    </div>

                  )}

                </div>

              )}

          
              {/* Tarea completadas publicas */}
              <div className="i-titulo-tareas"> Tareas Completadas </div>
              {tareasCompletadas ? (
                  <div className='i-tareas-container'>
                    {tareasCompletadas.length === 0 ? (
                      <div className="m-error">
                      No hay tareas completadas.
                      </div>
                    ) : (
                      <div>
                        {tareasCompletadas.map((tarea, idTarea) => (
                          <div className="i-tarea-container-2" key={idTarea}>
                            <div className="i-tarea">
                              <div className="i-tarea-info">
                                <div className="c-titulo-texto-tarea" style={{maxWidth: '400px', whiteSpace: 'nowrap'}}>{tarea.titulo}</div>
                                <div className="i-tarea-desc">{tarea.descripcion}
                                </div>
                                
                              </div>
                                <div className="i-tarea-botones">
                                  <div className="i-tarea-boton"><FaCalendar /> Fecha {formatDate(tarea.fechaEntrega)}</div>
                                  <div className="i-tarea-boton" style={{marginTop: '5px', cursor: 'pointer' }} onClick={() => handleMostrarEntregable(tarea.urlEntrega)} > <FaFolder /> Documento </div>
                                  <div className="i-tarea-boton" style={{marginTop: '5px'}} > {tarea.idAsignado && usuariosTodos && <>{usuariosTodos[tarea.idAsignado].nombreUsuario}</>} </div>
                                </div>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>  
                ) : (
                  <div className="m-error">
                  No hay tareas completadas.
                  </div>
              )}

          </div>

          <div className="i-seccion-miembros">
            <div className='i-seccion-1'>
              <div className="i-tipo-miembro">Dueño</div>
              {infoAdmin &&
                <div className="i-btn-miembro" onClick={() => handleMostrarMiembro(infoAdmin)}>
                    <div className='i-btn-miembro-contenido'>
                      {infoAdmin.nombreUsuario}
                    </div>
                </div>
              }
              <div className="i-tipo-miembro">
                Miembros {esAdmin && <IoMdAddCircleOutline className="i-agregar-miembros" onClick={() => setShowInvitarModal(true)}/>}
              </div>
              
              {/* Miembros */}
              <div>
                {miembros.length == 0 ? (
                  <div> No hay miembros. </div>
                ) : (
                  <div>
                    {miembros.map((miembro, idMiembro) => (
                      <div className="i-btn-miembro" key={idMiembro} onClick={() => handleMostrarMiembro(miembro)}>
                        <div className='i-btn-miembro-contenido' style={esAdmin? {width: '85%'} : {width: '100%'}}>
                          {miembro.nombreUsuario}
                        </div>

                        <div className='i-icon-estilos'>
                          {esAdmin && (
                            <FaTimesCircle className="i-icon-times-circle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMostrarEliminar(miembro);
                            }}/>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {esAdmin && (
                <button type="button" className="i-btn-ver-solicitudes" onClick={() => setShowSolicitudesModal(true)}>
                  <FaEnvelope style={{marginRight: "5px"}}/> Solicitudes
                </button>
              )}
            </div>

            <div className='i-guardar'>
              {!editingCampos || esAdmin && (
                <button className="i-btn-guardar" onClick={handleGuardarCampos} disabled={guardarCamposBloqueado || guardarCargando}>
                  {guardarCargando ? <ClipLoader size={20} color="#000" /> : 'Guardar'}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}

      {/* ----- Modales ----- */}

      {/* ----- Ver solicitudes ----- */}
      <Modal show={showSolicitudesModal} onHide={() => setShowSolicitudesModal(false)} centered className='e-modal'>
        <div className="modalcontainer, i-modal-lista-usuarios">
          {/* X */}
          <Modal.Header closeButton style={{ border: "none" }}> </Modal.Header>

          {/* Determinar en que página esta */}
          <div className='i-nav'>
            {iniciativa && !iniciativa.esPublica &&
              <button 
                className={paginaActual === 'solicitudes' ? 'paginaActual' : ''} 
                onClick={() => setPaginaActual('solicitudes')}
              >
                Solicitudes recibidas
              </button>
            }
            <button 
              className={paginaActual === 'miembros' ? 'paginaActual' : ''} 
              onClick={() => setPaginaActual('miembros')}
            >
              Solicitudes enviadas
            </button>
          </div>

          {/* Contenido */}
          <Modal.Body style={{paddingTop: '20px'}}>
            {/* Solicitudes */}
            {paginaActual === 'solicitudes' ? (
              !usuariosRecibidos || usuariosRecibidos.length == 0 ? (
                <div className="i-error-modal">
                  {/* Ninguna solicitud */}
                  Esta iniciativa no ha recibido solicitudes.
                </div>
              ) : (
                <div>
                  {/* Lista de solicitudes */}
                  {usuariosRecibidos.map((usuario, index) => (
                    <React.Fragment key={index}>
                      <div className='i-invitar-usuarios'>
                        <div className='i-columna-pe'>
                          <div className='i-informacion-usuarios'>
                            {/* Imagen */}
                            <img src={usuario.urlImagen} alt={usuario.nombreUsuario} />

                            {/* Usuario */}
                            <div className='i-informacion-usuario'>
                              <div style={{fontWeight: '600'}}>
                                {usuario.nombreUsuario}
                              </div>

                              <div>
                                {usuario.nombre}
                              </div>
                            </div>
                          </div>

                          {/* Etiquetas */}
                          <div className="i-etiquetas-2">
                              {Object.values(usuario.listaHabilidades).map((habilidad, idHabilidad) => (
                                <li key={idHabilidad} className={`i-etiqueta-item-2`}>
                                  {habilidad}
                                </li>
                              ))}
                          </div>
                        </div>

                        {/* Botones */}
                        <div className="i-btn-container">
                          {/* Aceptar */}
                          <button 
                            className="i-invitar-usuarios-boton"
                            onClick={() => handleAceptarSolicitud(index, usuario)}
                            disabled={aceptarSolicitudD[index]}
                          >
                            {aceptarSolicitudD[index] ? <ClipLoader size={20} color="#000" /> : 'Aceptar'}
                          </button>
                          
                          {/* Rechazar */}
                          <button 
                            className="i-invitar-usuarios-boton"
                            style={{marginLeft: '10px'}}
                            onClick={() => handleRechazarSolicitud(index, usuario)}
                            disabled={rechazarSolicitudD[index]}
                          >
                            {rechazarSolicitudD[index]? <ClipLoader size={20} color="#000" /> : 'Rechazar'}
                          </button>
                        </div>
                      </div>

                      {/* Línea entre elementos */}
                      {index < Object.values(usuariosRecibidos).length - 1 && <hr/>}
                    </React.Fragment>
                  ))}
                </div>
              )
            ) : (
              !usuariosEnviados || usuariosEnviados.length === 0 ? (
                <div className="i-error-modal">
                  {/* Ninguna solicitud enviada */}
                  Esta iniciativa no ha enviado solicitudes.
                </div>
              ) : (
                <div>
                  {/* Contenido de miembros */}
                  <div>
                  {usuariosEnviados.map((usuario, index) => (
                    <React.Fragment key={index}>
                      <div className='i-invitar-usuarios'>
                        {/* Información usuario */}
                        <div className='i-informacion-usuarios'>
                          <img src = {usuario.urlImagen}/>

                          <div className='i-informacion-usuario'>
                            <div style={{fontWeight: '600'}}>
                              {usuario.nombreUsuario}
                            </div>

                            <div>
                              {solicitudesEnviadas[index].estado}
                              {solicitudesEnviadas[index].estado === 'Aceptada' && <FaCheckCircle className='fa-1'/>}
                              {solicitudesEnviadas[index].estado === 'Rechazada' && <FaTimesCircle className='fa-2'/>}
                              {solicitudesEnviadas[index].estado === 'Pendiente' && <FaHourglass className='fa-3'/>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Basura */}
                        <div className='i-btn-container' onClick={(e) => e.stopPropagation()}>
                          <button 
                            className='i-invitar-usuarios-boton-2' 
                            onClick={() => handleCancelarUsuario(index, solicitudesEnviadas[index].idUsuario)} 
                            disabled={faTrashBloqueado[index]}
                          >
                            {faTrashBloqueado[index] ? <ClipLoader size={20} color="#000" /> : <FaTrash/>}
                          </button>
                        </div>
                      </div>

                      {/* Línea entre elementos */}
                      {index < Object.values(usuariosEnviados).length - 1 && <hr/>}
                    </React.Fragment>    
                  ))}
                  </div>
                </div>
              )
            )}
          </Modal.Body>
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
            {cargandoTarea ? <ClipLoader size={24} color="#fff"/> : 'Guardar'}
          </Button>
          <Button onClick={closeUploadModal} style={{width: '115px'}}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Asignar tarea a usuario */}
      <Modal show={showAsignarModal} onHide={closeUploadModal} centered className='e-modal'>
        <div className="modalcontainer, i-modal-lista-usuarios">
          <Modal.Header closeButton style={{border: 'none'}}>
            <Modal.Title>Asignar a usuario</Modal.Title>
          </Modal.Header>
          
          {/* Cuerpo */}
          <Modal.Body style={{paddingTop: '0px'}}>
            {/* Searchbar */}
            <div className='e-searchBar' style={{marginBottom: '20px'}}>
              <FaSearch className="e-icons"/>
              <input
                type='search'
                placeholder='Buscar usuarios...'
                value={filtroAsignar}
                onChange={buscarUsuarioAsignar}
                className='e-searchBarCaja'
              />
            </div>
            
            {/* Lista usuarios */}
            {totalMiembros && selectedTaskIndex != null ? (
              (Object.values(totalMiembros).length == 0) ? (
                <div className="m-error">
                  No se encontraron usuarios.
                </div>
              ) : (
                <>
                  {Object.values(totalMiembros).map((usuario, index) => (
                    <React.Fragment key={index}>
                      <div className='i-invitar-usuarios'>
                        {/* Información usuario */}
                        <div className='i-informacion-usuarios'>
                          <img src = {usuario.urlImagen}/>

                          <div className='i-informacion-usuario'>
                            <div style={{fontWeight: '600'}}>
                              {usuario.nombreUsuario}
                            </div>
                            <div>
                              {usuario.nombre}
                            </div>
                          </div>
                        </div>

                        {/* Boton invitar */}
                          <div className='i-btn-container'>
                            <Button className='i-invitar-usuarios-boton' onClick={() => {tareas[selectedTaskIndex].idAsignado = usuario.idUsuario; setTareas([...tareas]); setShowAsignarModal(false);}}>
                              Asignar
                            </Button>
                          </div>

                      </div>

                      {index < Object.values(totalMiembros).length - 1 && <hr/>}
                    </React.Fragment>
                  ))}
                </>
              )
            ) : (
              <div className="spinner" style={{width: "100%", justifyContent: "center"}}>
                <Spinner animation="border" role="status"></Spinner>
              </div>
            )}
          </Modal.Body>
        </div>
      </Modal>


      {/* MOSTRAR ENTREGABLE TAREA */}
      <Modal className="i-modal-doc" show={modalEntregable} onHide={handleCerrarImagen}>
        <Modal.Header>
          <div className="i-modal-doc-title">Archivo Entregado</div>
        </Modal.Header>
          
        <div className="i-doc-body">

          <iframe  src={selectedEntregable} frameborder="0" width="100%" height="100%"></iframe>
          
        </div>

        <Modal.Footer>
          <Button onClick={handleCerrarImagen}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      

      {/* Modal confirmar eliminar iniciativa*/}
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
      
      {/* Modal iniciativa eliminada*/}
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

      {/* Modal para invitar usuarios */}
      <Modal show={showInvitarModal} onHide={() => setShowInvitarModal(false)} centered className='e-modal'>
        <div className="modalcontainer, i-modal-lista-usuarios">
          {/* Titulo + X */}
          <Modal.Header closeButton style={{border: 'none'}}>
            <Modal.Title>Invitar usuarios</Modal.Title>
          </Modal.Header>

          {/* Cuerpo */}
          <Modal.Body style={{paddingTop: '0px'}}>
            {/* Searchbar */}
            <div className='e-searchBar' style={{marginBottom: '20px'}}>
              <FaSearch className="e-icons"/>
              <input
                type='search'
                placeholder='Buscar usuarios...'
                value={filtro}
                onChange={buscarUsuario}
                className='e-searchBarCaja'
              />
            </div>

            {/* Lista usuarios */}
            {usuariosFiltrados ? (
              (Object.values(usuariosFiltrados).length == 0) ? (
                <div className="m-error">
                  No se encontraron usuarios.
                </div>
              ) : (
                <>
                  {Object.values(usuariosFiltrados).map((usuario, id) => (
                    <React.Fragment key={id}>
                      <div className='i-invitar-usuarios'>
                        {/* Información usuario */}
                        <div className='i-informacion-usuarios'>
                          <img src = {usuario.urlImagen}/>

                          <div className='i-informacion-usuario'>
                            <div style={{fontWeight: '600'}}>
                              {usuario.nombreUsuario}
                            </div>

                            <div>
                              {usuario.nombre}
                            </div>
                          </div>
                        </div>

                        {/* Boton invitar */}
                        {!usuariosFiltrados[usuario.idUsuario].invitarDesactivado && (
                          <div className='i-btn-container'>
                            <Button className='i-invitar-usuarios-boton' onClick={() => handleInvitarUsuario(usuario.idUsuario)}>
                              Invitar
                            </Button>
                          </div>
                        )}

                        {/* Spinner */}
                        {usuariosFiltrados[usuario.idUsuario].invitarCargando && (
                          <div className='i-btn-container'>
                            <Button className='i-invitar-usuarios-boton' disabled={true}>
                              <ClipLoader size={16} color="#fff" />
                            </Button>
                          </div>
                        )}

                        {/* Boton cancelar */}
                        {!usuariosFiltrados[usuario.idUsuario].cancelarDesactivado && (
                          <div className='i-btn-container'>
                            <Button className='i-invitar-usuarios-boton' onClick={() => handleCancelarUsuario(id, usuario.idUsuario)}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Línea entre elementos */}
                      {id < Object.values(usuariosFiltrados).length - 1 && <hr/>}
                    </React.Fragment>
                  ))}
                </>
              )
            ) : (
              <div className="spinner" style={{width: "100%", justifyContent: "center"}}>
                <Spinner animation="border" role="status"></Spinner>
              </div>
            )}
          </Modal.Body>  
        </div>
      </Modal>

      {/* Modal para ver información de miembro */}
      <Modal show={modalMiembro} onHide={() => setModalMiembro(false)} centered className='e-modal'>
        <div className="modalcontainer">
          <Modal.Header style={{ border: "none" }} closeButton> </Modal.Header>
          
          {miembroSeleccionado && (
            <div className="i-modal-miembro">
              <div className="i-miembro-perfil">
                {/* Foto de perfil */}
                <div className="modalhead">
                  <img src={miembroSeleccionado.urlImagen} alt={miembroSeleccionado.nombre} className="modalimg" />
                </div>
                
                {/* Nombre */}
                <div className="i-miembro-info">
                  <div className='i-miembro-nombre'>{miembroSeleccionado.nombre}</div>

                  <div className="i-miembro-datos">
                    {/* Edad */}
                    <div style={{display: "flex", marginBottom: "10px"}}>
                      <span style={{fontWeight: "bold"}}>Edad:&nbsp;</span> {miembroSeleccionado.edad} años
                    </div>

                    {/* Usuario */}
                    <div style={{display: "flex", marginBottom: "10px"}}>
                      <FaUser style={{marginRight: "5px", marginTop: "4px"}}/>
                      <span style={{fontWeight: "bold"}}>Usuario:&nbsp;</span> {miembroSeleccionado.nombreUsuario}
                    </div>
                    
                    {/* Correo */}
                    <div>
                      <FaEnvelope style={{marginRight: "5px"}}/>
                      <span style={{fontWeight: "bold"}}>Correo:</span> <span style={{textDecoration: "underline"}}>{miembroSeleccionado.correo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              <div className='i-miembro-habilidades'>
                Habilidades
              </div>

              <div className="m-etiquetas" style={{marginBottom: "20px"}}>
                {Object.values(miembroSeleccionado.listaHabilidades).map((etiqueta, idEtiqueta) => (
                  <li key={idEtiqueta} className={'m-etiqueta-item'}>{etiqueta}</li>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};