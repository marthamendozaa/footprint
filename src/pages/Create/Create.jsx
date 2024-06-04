import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaFolder, FaPen, FaExclamationCircle, FaGlobe, FaUnlockAlt, FaLock, FaImages, FaSearch } from 'react-icons/fa';
import { IoMdAddCircleOutline } from "react-icons/io";
import { Modal, Button, Spinner } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDropzone } from 'react-dropzone';
import { getIntereses, getRegiones, crearIniciativa, actualizaIniciativa, subirImagen, crearTareas, getUsuarios, getUsuario, crearSolicitud } from '../../api/api.js';
import Iniciativa from '../../classes/Iniciativa.js';
import Solicitud from '../../classes/Solicitud.js'
import Fuse from 'fuse.js';
import Tarea from '../../classes/Tarea.js';
import './Create.css';

export const Create = () => {
  class ItemTarea {
    constructor() {
      this.titulo = "";
      this.descripcion = "";
      this.editandoTitulo = false;
      this.editandoDesc = false;
      this.datePickerEntrega = React.createRef();
      this.fechaEntrega = new Date();
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const etiquetasData = await getIntereses();
      setEtiquetas(etiquetasData);

      const regionesData = await getRegiones();
      setRegiones(regionesData);

      const usuarioAdmin = await getUsuario(user);
      const adminID = usuarioAdmin.idUsuario;

      const usuariosData = await getUsuarios();

      const usuariosSinMiembros = Object.values(usuariosData).filter(usuario => 
        usuario.idUsuario !== adminID && !usuario.esAdmin
      );

      setUsuarios(usuariosSinMiembros);
      setUsuariosFiltrados(usuariosSinMiembros);
      console.log("usuarios:", usuariosSinMiembros);
    };
    fetchData();
  }, []);


  // Lista de tareas
  const [tareas, setTareas] = useState([new ItemTarea()]);


  // Cambiar título Tarea
  const handleCambioTituloTarea = (event, idTarea) => {
    const { value } = event.target;
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].titulo = value;
    setTareas(tareasNuevo);
  };

  const handleEditarTituloTarea = (idTarea) => {
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].editandoTitulo = true;
    setTareas(tareasNuevo);
  };

  const handleGuardarTituloTarea = (idTarea) => {
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].editandoTitulo = false;
    setTareas(tareasNuevo);
  };

  const handleOnKeyDownTarea = (event, idTarea) => {
    if (event.key === 'Enter') {
      const tareasNuevo = [...tareas];
      tareasNuevo[idTarea].editandoTitulo = false;
      tareasNuevo[idTarea].editandoDesc = false;
      setTareas(tareasNuevo);
    }
  };


  // Cambiar descripción Tarea
  const handleCambioDescTarea = (event, idTarea) => {
    const { value } = event.target;
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].descripcion = value;
    setTareas(tareasNuevo);
  };

  const handleEditarDescTarea = (idTarea) => {
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].editandoDesc = true;
    setTareas(tareasNuevo);
  };

  const handleGuardarDescTarea = (idTarea) => {
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].editandoDesc = false;
    setTareas(tareasNuevo);
  };


  // Cambiar fecha entrega Tarea
  const handleCambioFechaEntrega = (date, idTarea) => {
    const tareasNuevo = [...tareas];
    tareasNuevo[idTarea].fechaEntrega = date;
    setTareas(tareasNuevo);

    if (tareas[idTarea].datePickerEntrega.current) {
      tareas[idTarea].datePickerEntrega.current.setOpen(true);
    }
  };


  // Crear tarea
  const [modalTarea, setModalTarea] = useState(false);
  const handleCerrarTarea = () => setModalTarea(false);
  const handleMostrarTarea = () => setModalTarea(true);

  const handleCrearTarea = async () => {  
    if (tareas.find(tarea => !tarea.titulo || !tarea.descripcion || !tarea.fechaEntrega)) {
      handleMostrarTarea();
      return;
    }
    const tareasNuevo = [...tareas, new ItemTarea()];
    setTareas(tareasNuevo);
  };


  // Cambiar título
  const [titulo, setTitulo] = useState("");
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  const handleCambioTitulo = (event) => {
    setTitulo(event.target.value);
  };

  const handleEditarTitulo = () => {
    setEditandoTitulo(true);
  };

  const handleGuardarTitulo = () => {
    setEditandoTitulo(false);
  };

  const handleOnKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEditandoTitulo(false);
      setEditandoDesc(false);
    }
  };


  // Cambiar descripción
  const [desc, setDesc] = useState("");
  const [editandoDesc, setEditandoDesc] = useState(false);

  const textareaRef = useRef(null);

  const handleCambioDesc = (event) => {
    setDesc(event.target.value);
    autoResizeTextarea();
  };

  const handleEditarDesc = () => {
    setEditandoDesc(true);
  };

  const handleGuardarDesc = () => {
    setEditandoDesc(false);
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editandoDesc) {
      autoResizeTextarea();

      if (editandoDesc && textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
        textareaRef.current.focus();
      }
    }
  }, [editandoDesc]);

  // Seleccionar etiquetas
  const [etiquetas, setEtiquetas] = useState(null);
  const [etiquetasIniciativa, setEtiquetasIniciativa] = useState({});

  const seleccionaEtiqueta = async (etiqueta, idEtiqueta) => {
    const nuevaEtiquetasIniciativa = {...etiquetasIniciativa};

    if (nuevaEtiquetasIniciativa.hasOwnProperty(idEtiqueta)) {
      delete nuevaEtiquetasIniciativa[idEtiqueta];
    } else {
      nuevaEtiquetasIniciativa[idEtiqueta] = etiqueta;
    }
    setEtiquetasIniciativa(nuevaEtiquetasIniciativa);
  };
  

  // Cambiar fechas
  const [today, setToday] = useState(new Date());
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaCierre, setFechaCierre] = useState(new Date());
  const datePickerInicio = useRef(null);
  const datePickerCierre = useRef(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const handleCambioFechaInicio = () => {
    if (datePickerInicio.current) {
      datePickerInicio.current.setOpen(true);
    }
  };

  const handleCambioFechaCierre = () => {
    if (datePickerCierre.current) {
      datePickerCierre.current.setOpen(true);
    }
  };


  // Dropdown privacidad
  const [esPublica, setEsPublica] = useState(true);
  const [dropdownPrivacidad, setDropdownPrivacidad] = useState(false);

  const handleSeleccionaPrivacidad = (privacidad) => {
    setEsPublica(privacidad);
    setDropdownPrivacidad(false);
  };


  // Búsqueda y dropdown región
  const [region, setRegion] = useState("");
  const [regiones, setRegiones] = useState(null);
  const [buscaRegion, setBuscaRegion] = useState("");
  const [resultadosRegion, setResultadosRegion] = useState([]);
  const [dropdownRegion, setDropdownRegion] = useState(false);
  

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
    setRegion(region);
    setDropdownRegion(false);
  };


  // Cerrar dropdowns al hacer click fuera de ellos
  const dropdownPrivacidadRef = useRef(null);
  const dropdownRegionRef = useRef(null);

  useEffect(() => {
    const handleCerrarDropdown = (event) => {
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
  

  // Subir imagen
  const [imagenBloqueado, setImagenBloqueado] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenIniciativa, setImagenIniciativa] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('https://t3.ftcdn.net/jpg/02/68/55/60/360_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg');
  
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

  // React Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImagenSeleccionada(acceptedFiles[0]);
        setErrorImagen('');
      }
    }
  });

  const [showInvitarModal, setShowInvitarModal] = useState(false); 
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [estadoBotones, setEstadoBotones] = useState({});
  const [solicitudesPorCrear, setSolicitudesPorCrear] = useState([]);
  const [invitarCargando, setInvitarCargando] = useState(false); //Implementar?

  useEffect(() => {
    if (usuarios) {
      // Initialize button state
      const estadoInicial = {};
      usuarios.forEach(usuario => {
        estadoInicial[usuario.idUsuario] = {
          invitarDesactivado: false,
          cancelarDesactivado: true
        };
      });
      setEstadoBotones(estadoInicial);
      console.log("estadoInicial", estadoInicial);
    }
  }, [usuarios]);

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

  const handleInvitarUsuario = (id) => {
    const nuevoSolicitudes = [...solicitudesPorCrear, id];
    setSolicitudesPorCrear(nuevoSolicitudes);

    const nuevoEstados = {...estadoBotones};
    nuevoEstados[id].invitarDesactivado = true;
    nuevoEstados[id].cancelarDesactivado = false;
    setEstadoBotones(nuevoEstados);
  }

  const handleCancelarUsuario = (id) => {
    const nuevoSolicitudes = solicitudesPorCrear.filter(idUsuario => idUsuario != id);
    setSolicitudesPorCrear(nuevoSolicitudes);

    const nuevoEstados = {...estadoBotones};
    nuevoEstados[id].invitarDesactivado = false;
    nuevoEstados[id].cancelarDesactivado = true;
    setEstadoBotones(nuevoEstados);
  }

  // Crear iniciativa
  const [modalError, setModalError] = useState(false);
  const handleCerrarError = () => setModalError(false);
  const handleMostrarError = () => setModalError(true);

  // Iniciativa creada
  const [idIniciativaCreada, setIdIniciativaCreada] = useState(null);
  const [modalCreada, setModalCreada] = useState(false);
  const handleCerrarCreada = () => setModalCreada(false);
  const handleMostrarCreada = () => setModalCreada(true);

  // Error al crear iniciativa
  const [modalErrorCreada, setModalErrorCreada] = useState(false);
  const handleCerrarErrorCreada = () => setModalErrorCreada(false);
  const handleMostrarErrorCreada = () => setModalErrorCreada(true);

  // Error: iniciativa duplicada
  const [modalErrorDuplicada, setModalErrorDuplicada] = useState(false);
  const handleCerrarErrorDuplicada = () => setModalErrorDuplicada(false);
  const handleMostrarErrorDuplicada = () => setModalErrorDuplicada(true);

  // Tiempo de espera
  const [tiempoIniciativaCreada, setTiempoIniciativaCreada] = useState(0);
  const [modalTiempoEspera, setModalTiempoEspera] = useState(false);
  const handleCerrarTiempo = () => setModalTiempoEspera(false);
  const handleMostrarTiempo = () => setModalTiempoEspera(true);


  // Crear iniciativa
  const [crearDesactivado, setCrearDesactivado] = useState(false);

  const handleCrearIniciativa = async () => {
    if (!titulo || !desc || region === "" || Object.keys(etiquetasIniciativa).length === 0 || !fechaInicio || tareas.find(tarea => !tarea.titulo || !tarea.descripcion || !tarea.fechaEntrega)) {
      handleMostrarError();
      return;
    }

    const tiempoActual = Date.now();
    if (tiempoActual - tiempoIniciativaCreada < 60000) {
      handleMostrarTiempo();
      return;
    }
    
    const fechaInicioMini = format(fechaInicio, 'dd/MM/yyyy');
    const fechaCierreMini = fechaCierre ? format(fechaCierre, 'dd/MM/yyyy') : null;
    
    setCrearDesactivado(true);

    try {
      // Crear iniciativa
      const iniciativa = new Iniciativa(user, titulo, desc, region, esPublica, etiquetasIniciativa, fechaInicioMini, fechaCierreMini);
      const idIniciativa = await crearIniciativa(iniciativa);
  
      // Manejar errores
      if (idIniciativa === 409) {
        handleMostrarErrorDuplicada();
        return;
      } else if (idIniciativa === 500) {
        handleMostrarErrorCreada();
        return;
      }
      
      // Subir imagen de la iniciativa y actualizar información
      let urlImagen = iniciativa.urlImagen;
      if (imagenIniciativa) {
        const url = await subirImagen(imagenIniciativa, `Iniciativas/${idIniciativa}`);
        urlImagen = url;
      }
      const iniciativaNueva = { ...iniciativa, urlImagen: urlImagen, idIniciativa: idIniciativa};
      await actualizaIniciativa(iniciativaNueva);

      // Crear tareas
      const tareasIniciativa = [];
      for (const tarea of tareas) {
        const nuevaTarea = new Tarea(idIniciativa, user, tarea.titulo, tarea.descripcion, tarea.fechaEntrega);
        tareasIniciativa.push(nuevaTarea);
      }
      await crearTareas(tareasIniciativa);

      console.log("solicitudesPorCrear:", solicitudesPorCrear);
        if (!solicitudesPorCrear || solicitudesPorCrear.length === 0) {
            console.log("No hay solicitudes por crear.");
        } else {
            for (const idSolicitud of solicitudesPorCrear) {
                // Crear cada solicitud
                const solicitud = new Solicitud(idSolicitud, idIniciativa, "Pendiente", "IniciativaAUsuario");
                const response = await crearSolicitud(solicitud);

                // Log para depuración
                console.log("Solicitud creada:", solicitud);
                console.log("Respuesta de creación de solicitud:", response);

                const usuarioSolicitud = await getUsuario(idSolicitud);
                console.log("Usuario solicitud:", usuarioSolicitud);

                // Verifica si response.success existe y es verdadero
                if (response && response.success) {
                    if (!iniciativa.listaSolicitudes) {
                        iniciativa.listaSolicitudes = [];
                    }
                    if (!usuarioSolicitud.listaSolicitudes) {
                        usuarioSolicitud.listaSolicitudes = [];
                    }
                    iniciativa.listaSolicitudes.push(response.data);
                    usuarioSolicitud.listaSolicitudes.push(response.data);
                } else {
                    console.error("Error al crear solicitud:", response);
                }
              }
            }

      setIdIniciativaCreada(idIniciativa);
      handleMostrarCreada();
      setTiempoIniciativaCreada(tiempoActual);
    } catch (error) {
      handleMostrarErrorCreada();
    } finally {
      setCrearDesactivado(false);
    }
  };

  // Descripcion


  return (
    <div>
      {etiquetas && regiones ? (
        <div className="c-container">
          <div className="c-iniciativa-container">
            {/* Foto de iniciativa */}
            <div className="c-foto-iniciativa" onClick={handleMostrarImagen}>
              <img src={imagenPreview} className ="c-preview-imagen"/>
              <FaPen className="c-editar-foto"/>
            </div>

            <div className="c-info-container"> 
              {/* Cambiar título */}
              <div className="c-titulo">
                {editandoTitulo ? (
                  <div className="c-titulo-input" style={{height: "105px"}}>
                    <input
                      type="text"
                      className="c-titulo-input-texto"
                      value={titulo}
                      onChange={handleCambioTitulo}
                      onBlur={handleGuardarTitulo}
                      onKeyDown={handleOnKeyDown}
                      autoFocus
                      maxLength={30}
                    />
                    
                  </div>
                  ) : (
                    <div className="c-titulo-texto-tarea">
                      {titulo ? titulo : "Título"}
                    </div>
                  )}

                  {editandoTitulo ? (
                    <div className="c-titulo-conteo">
                      {titulo ? `${titulo.length}/30` : `0/30`}
                    </div>
                    ) : (
                      <button className="c-btn-editar-titulo" onClick={handleEditarTitulo}>
                        <FaPen />
                      </button>
                  )}
              </div>

              {/* Agregar etiquetas */}
              <div className="c-etiquetas">
                {Object.values(etiquetas).map((etiqueta, idEtiqueta) => (
                  <li key={idEtiqueta} className={`c-etiqueta-item ${Object.values(etiquetasIniciativa).includes(etiqueta) ? "highlighted" : ""}`} onClick={() => seleccionaEtiqueta(etiqueta, idEtiqueta)}>
                    {etiqueta}
                  </li>
                ))}
              </div>
              
              <div className="c-datos">
                {/* Fecha inicio y fecha cierre */}
                <div className="c-calendarios-container">
                  <div className="c-calendarios">
                    {/* Fecha inicio */}
                    <div className="c-calendario-input">
                      <div className="c-calendario" onClick={handleCambioFechaInicio}>
                        <FaCalendar/>
                      </div>
                      <DatePicker
                        className='react-datepicker__input-container-create'
                        selected={fechaInicio}
                        onChange={(date) => setFechaInicio(date)}
                        dateFormat="dd/MM/yyyy"
                        ref={datePickerInicio}
                        locale={es}
                        showYearDropdown
                        scrollableYearDropdown 
                        yearDropdownItemNumber={66}
                        showMonthDropdown
                        minDate={today}
                      />
                    </div>
                    
                    {/* Dash */}
                    <div className="c-calendario-separador"> - </div>

                    {/* Fecha cierre */}
                    <div className="c-calendario-input">
                      <div className="c-calendario" onClick={handleCambioFechaCierre}>
                        <FaCalendar/>
                      </div>
                      <DatePicker
                        className='react-datepicker__input-container-create'
                        selected={fechaCierre}
                        onChange={(date) => setFechaCierre(date)}
                        dateFormat="dd/MM/yyyy"
                        ref={datePickerCierre}
                        locale={es}
                        showYearDropdown
                        scrollableYearDropdown 
                        yearDropdownItemNumber={66}
                        showMonthDropdown
                        minDate={today}
                      />
                    </div>
                    
                  </div>
                </div>

                {/* Seleccionar privacidad */}
                <div className="c-dropdown-container" ref={dropdownPrivacidadRef}>
                  <button className="c-selecciona-dropdown" onClick={() => setDropdownPrivacidad(!dropdownPrivacidad)}>
                    {esPublica ? <FaUnlockAlt style={{marginRight: "5px"}}/> : <FaLock style={{marginRight: "5px"}}/>}
                    <span>{esPublica ? "Pública" : "Privada"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {dropdownPrivacidad && (
                    <div className="c-dropdown">
                      {/* Dropdown privacidad */}
                      <a className="c-dropdown-item" onClick={() => handleSeleccionaPrivacidad(true)}>Pública</a>
                      <a className="c-dropdown-item" onClick={() => handleSeleccionaPrivacidad(false)}>Privada</a>
                    </div>
                  )}
                </div>
                
                {/* Agregar región */}
                <div className="c-dropdown-container" ref={dropdownRegionRef}>
                  <button className="c-selecciona-dropdown" onClick={() => setDropdownRegion(!dropdownRegion)}>
                    <FaGlobe style={{marginRight: "5px"}}/>
                    <span className="mr-2">{region ? region : "Ubicación"}</span>
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
                        <a key={idRegion} className="c-dropdown-item" onClick={() => handleSeleccionaRegion(region)}> {region} </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="c-desc">
            {editandoDesc ?(
              <div className='c-container-conteo'>
                <div className="c-desc-conteo" style={{top: "-30px"}}>
                  {desc ? `${desc.length}/200` : `0/200`}
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
                      value={desc}
                      onChange={handleCambioDesc}
                      onBlur={handleGuardarDesc}
                      onKeyDown={handleOnKeyDown}
                      autoFocus
                      maxLength={200} 
                      style={{ borderColor: editandoDesc ? 'transparent' : 'transparent' }}
                    />
                </div>
              </div>
              ) : (
              <div className="c-desc-texto" style={{paddingBottom: '10.5px', paddingLeft: '2px'}}>
                <div style={desc ? {marginTop: '2px', padding: '15px'} : {marginTop: '2px', color: '#677D7C', padding: '15px'}}>
                  {desc ? desc : "Agrega tu descripción aquí..."}
                </div>

                {!editandoDesc && (<button className="c-btn-editar-desc" onClick={handleEditarDesc}><FaPen /></button>)}
              </div>
            )}
          </div>

          {/* Tareas y Miembros*/}
          <div className="c-tareas-miembros">
            <div className="c-seccion-tareas">

              {/* Agregar tarea */}
              <button type="button" className="c-btn-agregar-tarea" onClick={handleCrearTarea}>
                <IoMdAddCircleOutline style={{marginRight: "5px"}}/>
                Añadir tarea
              </button>

              {/* Tarea */}
              <div className="c-tareas-container">
                {tareas.map((tarea, idTarea) => (
                  <div className="c-tarea" key={idTarea}>
                    
                    {/* Titulo + descripción */}
                    <div className="c-tarea-info">

                      {/* Titulo */}
                      <div className="c-tarea-titulo">
                        {tarea.editandoTitulo? (
                          <input
                            type="text"
                            className="c-tarea-titulo"
                            value={tarea.titulo}
                            onChange={(e) => handleCambioTituloTarea(e, idTarea)}
                            onBlur={() => handleGuardarTituloTarea(idTarea)}
                            onKeyDown={(e) => handleOnKeyDownTarea(e, idTarea)}
                            autoFocus
                            maxLength={30}
                          />
                        ) : (
                          <div className="c-titulo-texto-tarea" style={{maxWidth: '400px', whiteSpace: 'nowrap'}}>
                            {tarea.titulo ? tarea.titulo : "Título"}
                          </div>
                        )}

                        {tarea.editandoTitulo? (
                          <button className="c-btn-editar-tarea" onClick={() => handleEditarTituloTarea(idTarea)}>
                            {tarea.titulo ? `${tarea.titulo.length}/30` : `0/30`}
                          </button>
                        ) : (
                          <button className="c-btn-editar-tarea" onClick={() => handleEditarTituloTarea(idTarea)}>
                            <FaPen />
                          </button>
                        )}
                      </div>
                      
                      {/* Descripcion */}
                      <div className="c-tarea-desc">
                        {tarea.editandoDesc ? (
                          <div className="c-tarea-texto">
                            <textarea
                              className="c-desc-input-texto"
                              value={tarea.descripcion}
                              onChange={(e) => handleCambioDescTarea(e, idTarea)}
                              onBlur={() => handleGuardarDescTarea(idTarea)}
                              onKeyDown={(e) => handleOnKeyDownTarea(e, idTarea)}
                              autoFocus
                              maxLength={200}
                            />
                          </div>
                        ) : (
                          <div style={tarea.descripcion ? {} : { color: '#677D7C' }}>
                            {tarea.descripcion ? tarea.descripcion : "Agrega tu descripción aquí..."}
                          </div>
                        )}
                        {!tarea.editandoDesc && (
                          <button className="c-btn-editar-tarea" onClick={() => handleEditarDescTarea(idTarea)}>
                            <FaPen />
                          </button>
                        )}
                      </div> 
                    </div>

                    {/* Botones izquierda */}
                    <div className="c-tarea-botones">
                      {/* Fecha */}
                      <div className="c-tarea-boton"><FaCalendar /> Fecha
                        <DatePicker
                          className='react-datepicker-2'
                          selected={tarea.fechaEntrega}
                          onChange={(date) => handleCambioFechaEntrega(date, idTarea)}
                          dateFormat="dd/MM/yyyy"
                          ref={tarea.datePickerEntrega}
                          locale={es}
                        />
                      </div>

                      {/* Documento */}
                      <div className="c-tarea-boton" style={{marginTop: '5px'}}><FaFolder /> Documento</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitar mimebros */}
            <div className="c-seccion-miembros">
              <div className="c-btn-invitar-miembro" onClick={handleShowInvitarModal}>
                <IoMdAddCircleOutline style={{marginRight: "5px"}}/>
                Invitar miembro
              </div>
            </div>
          </div>
          
          {/* Botón crear */}
          <div className="c-crear-container">
            <div className="c-btn-crear-container">
              <button type="button" className="c-btn-crear" onClick={handleCrearIniciativa} disabled={crearDesactivado}>
                {crearDesactivado ? <ClipLoader size={24} color="#fff" /> : 'Crear'}
              </button>
            </div>
          </div>

          {/* ----------------- Modales ----------------- */}

          {/* Subir imagen */}
          <Modal className="c-modal" show={modalImagen} onHide={handleCerrarImagen}>
            <Modal.Header>
              <div className="c-modal-title">Subir Imagen</div>
            </Modal.Header>
              
            <div className="c-input-body">
              <div {...getRootProps({ className: "c-drag-drop" })}>
                <input {...getInputProps()} />
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
          
          {/* Error campos vacíos */}
          <Modal className="c-modal" show={modalError} onHide={handleCerrarError}>
            <Modal.Header>
              <div className="c-modal-title">Error</div>
            </Modal.Header>
              <div className="c-modal-body" style={{textAlign:'left'}}>
                No se pueden dejar los siguientes campos vacíos:
                <ul>
                  {(!titulo && <li>Título</li>)}
                  {(!desc && <li>Descripción</li>)}
                  {(region === "" && <li>Región</li>)}
                  {Object.keys(etiquetasIniciativa).length === 0 && <li>Etiquetas</li>}
                  {!fechaInicio && <li>Fecha de inicio</li>}
                  {tareas.find(tarea => !tarea.titulo || !tarea.descripcion || !tarea.fechaEntrega) && <li>Tareas</li>}
                </ul>
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarError}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Tarea campos vacíos */}
          <Modal className="c-modal" show={modalTarea} onHide={handleCerrarTarea}>
            <Modal.Header>
              <div className="c-modal-title">Error</div>
            </Modal.Header>
              <div className="c-modal-body" style={{textAlign:'left'}}>
                No se pueden dejar tareas con campos vacíos
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarTarea}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          
          {/* Iniciativa creada */}
          <Modal className="c-modal" show={modalCreada} onHide={handleCerrarCreada}>
            <Modal.Header>
              <div className="c-modal-title">Éxito</div>
            </Modal.Header>
              <div className="c-modal-body">
                Iniciativa <span style={{fontWeight: 'bold'}}>{titulo}</span> creada exitosamente
              </div>
            <Modal.Footer>
              <Button className="btn btn-primary" onClick={handleCerrarCreada}>
                <Link to={`/initiative/${idIniciativaCreada}`}>Ver Iniciativa</Link>
              </Button>
            </Modal.Footer>
          </Modal>
          
          {/* Error creando inciativa */}
          <Modal className="c-modal" show={modalErrorCreada} onHide={handleCerrarErrorCreada}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                Error al crear iniciativa <span style={{fontWeight: 'bold'}}>{titulo}</span>
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarErrorCreada}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Error iniciativa duplicada */}
          <Modal className="c-modal" show={modalErrorDuplicada} onHide={handleCerrarErrorDuplicada}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                La iniciativa con título <span style={{fontWeight: 'bold'}}>{titulo}</span> ya existe
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarErrorDuplicada}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Tiempo de espera */}
          <Modal className="c-modal" show={modalTiempoEspera} onHide={handleCerrarTiempo}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                Debes esperar 1 minuto para poder crear una nueva iniciativa
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarTiempo}>Cerrar</Button>
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
                          <Button variant="primary" disabled={estadoBotones[usuario.idUsuario]?.invitarDesactivado} onClick={() => handleInvitarUsuario(usuario.idUsuario)} >
                            Invitar</Button>
                          <Button variant="primary" disabled={estadoBotones[usuario.idUsuario]?.cancelarDesactivado} onClick={() => handleCancelarUsuario(usuario.idUsuario)} >
                            Cancelar</Button>
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
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );
};